import { Body, Controller, Get, Header, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { PublicEndpoint } from '../auth/auth.decorator';
import { Metadata } from './dto/MetaData';
import { MediaService } from './media.service';
import { ObjectIdStringPipe } from '@/injectables/injectables/object-id-string.pipe';
import { UploadImageDto } from './dto/UploadImageDto';
import { FormDataRequest } from 'nestjs-form-data';
import { UploadVideoDto } from './dto/UploadVideoDto';

@Controller('/media')
@ApiTags('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('/image')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @FormDataRequest()
  uploadImage(@Body() dto: UploadImageDto) {
    return this.mediaService.saveFile(dto.img);
  }

  @Post('/video')
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadVideoDto })
  @FormDataRequest()
  uploadVideo(@Body() dto: UploadVideoDto) {
    return this.mediaService.saveFile(dto.video);
  }

  @Get(':mediaId')
  @ApiParam({ name: 'mediaId', type: String, required: true })
  @ApiQuery({
    name: 'size',
    type: String,
    required: false,
    description:
      '`mini`, `small`, `medium` or omitted, which would return the normal size of the image',
  })
  @PublicEndpoint()
  async getMedia(
    @Res() res: Response,
    @Param('mediaId', ObjectIdStringPipe) mediaId: string,
    @Query('size') size?: 'mini' | 'small' | 'medium',
  ) {
    const { url, expiresAt } = await this.mediaService.getMediaUrl(mediaId, size);
    const now = Date.now();

    if (now < expiresAt.getTime()) {
      res.setHeader(
        'cache-control',
        `max-age=${Math.min(60 * 60, expiresAt.getTime() - now)}, must-revalidate`,
      );
    }

    return res.redirect(HttpStatus.FOUND, url);
  }

  @Get(':mediaId/uploader')
  @ApiParam({ name: 'mediaId', type: String, required: true })
  @ApiResponse({ status: HttpStatus.OK, type: Metadata })
  @PublicEndpoint()
  async getUploader(@Param('mediaId', ObjectIdStringPipe) mediaId: string) {
    return this.mediaService.getUploader(mediaId);
  }

  @Get('/opengraph/scrape')
  @ApiQuery({ name: 'url', required: true })
  @Header('Cache-Control', `max-age=${60 * 60}`)
  @PublicEndpoint()
  openGraphScraper(@Query('url') url: string) {
    return this.mediaService.scrapeOpenGraphTags(url);
  }
}
