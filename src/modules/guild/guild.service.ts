import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';

import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Guild, GuildDocument } from './entity/Guild';
import { Connection, Model, Types } from 'mongoose';

import { CreateGuildDto } from './dto/CreateGuildDto';
import { withTransaction } from '@/utils/withTransaction';
import { MediaDocument } from '../media/entity/Media';

import { ExternalMediaService } from '../media/external-media.service';
import { DiscordContextService } from '../context.module';
import { CreateChannelDto } from './dto/CreateChannelDto';
import { Channel, ChannelDocument } from './entity/Channel';

@Injectable()
export class GuildService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Guild.name) private readonly guildModel: Model<GuildDocument>,
    @InjectModel(Channel.name) private readonly channelModel: Model<ChannelDocument>,
    @Inject(forwardRef(() => ExternalMediaService))
    private readonly externalMediaService: ExternalMediaService,
    private readonly discordContextService: DiscordContextService,
  ) {}

  async getGuilds(userId: string) {
    return this.guildModel.find({ ownerId: new Types.ObjectId(userId) }).lean();
  }

  async getGuildChannels(guildId: string) {
    const guild = await this.guildModel.findById(guildId).lean();

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    return this.channelModel.find({ guildId: new Types.ObjectId(guildId) }).lean();
  }

  async getGuildById(guildId: string) {
    const guild = await this.guildModel.findById(guildId).lean();

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    return guild;
  }

  async getChannelById(guildId: string, channelId: string) {
    const channel = await this.channelModel
      .findOne({
        _id: new Types.ObjectId(channelId),
        guildId: new Types.ObjectId(guildId),
      })
      .lean();

    if (!channel) {
      throw new NotFoundException(`channel ${channelId} not found`);
    }

    return channel;
  }

  async createChannel(guildId: string, dto: CreateChannelDto) {
    const guild = await this.guildModel.findById(guildId).select('_id').lean();

    if (!guild) {
      throw new NotFoundException("This post doesn't exit");
    }

    return this.channelModel.create({ ...dto, guildId });
  }

  async createGuild(dto: CreateGuildDto) {
    const { user } = this.discordContextService.get();
    return await withTransaction(this.connection, async (session) => {
      const { name, image } = dto;

      let media: MediaDocument;

      if (image) {
        media = await this.externalMediaService.saveFile(image, session);
      }

      const [guild] = await this.guildModel.create(
        [new Guild({ name, mediaId: media?.id, ownerId: user._id })],
        {
          session,
        },
      );

      return guild;
    });
  }
}
