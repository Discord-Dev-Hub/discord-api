import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { plainToInstance } from 'class-transformer';
import { addSeconds, startOfWeek } from 'date-fns';
import { unlink as _unlink, readFileSync } from 'fs';
import { map } from 'lodash';
import { ClientSession, Connection, Model, Types, isObjectIdOrHexString } from 'mongoose';
import { FileSystemStoredFile } from 'nestjs-form-data';
import sharp from 'sharp';
import { promisify } from 'util';

import { SupportedImageTypes } from './constants/SupportedImageTypes';
import { CreatePresignedS3UrlDto } from './dto/CreatePresignedS3UrlDto';
import { CreatePresignedS3UrlResponseDto } from './dto/CreatePresignedS3UrlResponseDto';
import { Metadata } from './dto/MetaData';
import { OpenGraphDto } from './dto/OpenGraphDto';
import { Media, MediaDocument } from './entity/Media';
import { DiscordContextService } from '../context.module';
import { withTransaction } from '@/utils/withTransaction';
import { config } from '@/injectables/config/config';
import { scrape } from '@/injectables/clients/opengraph';

const unlink = promisify(_unlink);

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly s3BucketName: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly context: DiscordContextService,
  ) {
    this.s3 = new S3Client({
      region: config.AWS_BUCKET_REGION,
      useAccelerateEndpoint: false,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.s3BucketName = config.AWS_BUCKET_NAME;
  }

  async onModuleInit() {
    this.s3.send(new HeadBucketCommand({ Bucket: this.s3BucketName }));
  }

  async saveFile(file: FileSystemStoredFile, session?: ClientSession, shouldResize = true) {
    if (session) {
      return this.doSaveFile(file, shouldResize, session);
    }

    return withTransaction(this.connection, async (session) =>
      this.doSaveFile(file, shouldResize, session),
    );
  }

  private async doSaveFile(
    file: FileSystemStoredFile,
    shouldResize: boolean,
    session: ClientSession,
  ) {
    if (file.mimetype.startsWith('video/')) {
      return this.saveVideo(file, session);
    }

    if (file.mimetype.startsWith('image/')) {
      return this.saveImage(file, shouldResize, session);
    }

    throw new UnsupportedMediaTypeException('The file you uploaded is un-supported by us.');
  }

  private async saveImage(
    file: FileSystemStoredFile,
    shouldResize: boolean,
    session: ClientSession,
  ): Promise<MediaDocument> {
    try {
      const quality = 100 - Number(((file.size / 1024 / 1024) * 3).toFixed());
      const format = SupportedImageTypes.webp;
      const { user } = this.context.get();

      const [normal, mini, small, medium] = await Promise.all(
        shouldResize
          ? [
              sharp(file.path)
                .toFormat(format)
                .webp({ quality: quality - 8 })
                .toBuffer(),
              sharp(file.path)
                .resize({ height: 64, width: 64, fit: 'inside' })
                .toFormat(format)
                .webp({ quality: quality })
                .toBuffer(),
              sharp(file.path)
                .resize({ height: 256, width: 256, fit: 'inside' })
                .toFormat(format)
                .webp({ quality: quality - 2 })
                .toBuffer(),
              sharp(file.path)
                .resize({ height: 512, width: 512, fit: 'inside' })
                .toFormat(format)
                .webp({ quality: quality - 4 })
                .toBuffer(),
            ]
          : [
              sharp(file.path)
                .toFormat(format)
                .webp({ quality: quality - 8 })
                .toBuffer(),
            ],
      );

      const [media] = await this.mediaModel.create(
        [
          {
            name: file.originalName || `${user?.id}-${Date.now()}`,
            mimetype: `image/${format}`,
            active: true,
            submittedBy: new Types.ObjectId(user?.id),
            mini: mini ? new Types.ObjectId() : null,
            small: small ? new Types.ObjectId() : null,
            medium: medium ? new Types.ObjectId() : null,
          },
        ],
        { session },
      );

      const medias = [
        { media: normal, id: media.id },
        { media: mini, id: media.mini?.toHexString() },
        { media: small, id: media.small?.toHexString() },
        { media: medium, id: media.medium?.toHexString() },
      ].filter(({ media }) => !!media);

      await Promise.all(
        map(medias, ({ id, media }) =>
          this.s3.send(
            new PutObjectCommand({
              Bucket: this.s3BucketName,
              Key: id,
              Body: media,
              ContentType: `image/${format}`,
            }),
          ),
        ),
      );

      await unlink(file.path).catch((e) => {
        this.logger.error('Failed cleaning up image upload leftovers', (e as Error).stack);
      });

      return media;
    } catch (e) {
      this.logger.error('Failed uploading image', (e as Error).stack);
      throw new InternalServerErrorException('Failed uploading image');
    }
  }

  private async saveVideo(
    file: FileSystemStoredFile,
    session: ClientSession,
  ): Promise<MediaDocument> {
    try {
      const { user } = this.context.get();

      const [media] = await this.mediaModel.create(
        [
          {
            name: file.originalName || `${user?.id}-${Date.now()}`,
            mimetype: file.mimetype,
            active: true,
            submittedBy: user?.id,
          },
        ],
        { session },
      );

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.s3BucketName,
          Key: media.id,
          Body: readFileSync(file.path),
          ContentType: file.mimetype,
        }),
      );

      await unlink(file.path).catch((e) => {
        this.logger.error('Failed cleaning up video upload leftovers', (e as Error).stack);
      });

      return media;
    } catch (e) {
      this.logger.error('Failed uploading video', e);
      throw new InternalServerErrorException('Failed uploading video');
    }
  }

  async getMediaUrl(mediaId: string, size?: 'mini' | 'small' | 'medium') {
    const media = await this.mediaModel.findById(mediaId);

    if (!media) {
      throw new NotFoundException();
    }

    const mediaKey: string = isObjectIdOrHexString(media.name)
      ? media.name
      : media[size]
      ? media[size]?.toHexString()
      : media._id.toHexString();

    const command = new GetObjectCommand({
      Bucket: this.s3BucketName,
      Key: mediaKey,
    });

    const signingDate = startOfWeek(new Date(), { weekStartsOn: 1 });

    const expiresIn = 7 * 24 * 60 * 60;
    const expiresAt = addSeconds(signingDate, expiresIn);
    const url = await getSignedUrl(this.s3, command, { expiresIn, signingDate });

    return { url, expiresAt, signingDate, expiresIn, type: media.mimetype };
  }

  async getMediaFromBucket(mediaKey: string) {
    const command = new HeadObjectCommand({
      Bucket: this.s3BucketName,
      Key: mediaKey,
    });

    const media = await this.s3.send(command);

    if (!media) {
      throw new NotFoundException(`Media with Key of ${mediaKey} wasn't found.`);
    }

    return { key: media.Metadata?.key };
  }

  async getUploader(mediaId: string) {
    const media = await this.mediaModel.findById(mediaId).populate('uploader');
    return new Metadata({ submittedBy: media.uploader, submittedById: media.submittedBy });
  }

  async deleteMedia(mediaId: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.s3BucketName, Key: mediaId }));
    await this.mediaModel.deleteOne({ _id: new Types.ObjectId(mediaId) });
  }

  async scrapeOpenGraphTags(url: string) {
    try {
      const ogData = await scrape(url);
      const dto = plainToInstance(OpenGraphDto, ogData, { excludeExtraneousValues: true });

      return dto;
    } catch (e) {
      this.logger.log(e.message, e.stack);
      throw new InternalServerErrorException(e);
    }
  }

  async createPresignedS3Url(
    dto: CreatePresignedS3UrlDto,
  ): Promise<CreatePresignedS3UrlResponseDto> {
    const { contentType, fileName } = dto;

    const { user } = this.context.get();

    const fileDocument = await this.mediaModel.create({
      name: fileName,
      submittedBy: user?._id,
      active: false,
      mimetype: `video/${contentType}`,
    });
    const key = fileDocument.id;

    const { url, fields } = await createPresignedPost(this.s3, {
      Bucket: this.s3BucketName,
      Key: key,
      Conditions: [
        ['content-length-range', 1, 209715200], // 200 Mb
        { 'Content-Type': `video/${contentType}` },
        { bucket: this.s3BucketName },
        { key },
      ],
      Fields: {
        key,
        'Content-Type': `video/${contentType}`,
        'x-amz-meta-key': key,
        'x-amz-meta-contenttype': `video/${contentType}`,
      },
    });

    return new CreatePresignedS3UrlResponseDto({
      presignedUrl: url,
      key,
      fields,
    });
  }
}
