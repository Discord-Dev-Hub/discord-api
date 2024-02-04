import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Guild, GuildDocument } from './entity/Guild';
import { Connection, Model, Types } from 'mongoose';

import { CreateGuildDto } from './dto/CreateGuildDto';
import { withTransaction } from '@/utils/withTransaction';
import { MediaDocument } from '../media/entity/Media';

import { ExternalMediaService } from '../media/external-media.service';
import { DiscordContextService } from '../context.module';
import { CreateChannelDto } from './dto/CreateChannelDto';
import { GuildChannel, GuildChannelDocument } from './entity/GuildChannel';
import { GuildMember, GuildMemberDocument } from './entity/GuildMember';
import { RolePermissions } from './constants/RolePermissions';
import { enumerate } from '@/utils/enumerate';
import { GuildRole, GuildRoleDocument } from './entity/GuildRole';
import { GuildChannelTypes } from './constants/GuildChannelTypes';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class GuildService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Guild.name) private readonly guildModel: Model<GuildDocument>,
    @InjectModel(GuildChannel.name) private readonly guildChannelModel: Model<GuildChannelDocument>,
    @InjectModel(GuildMember.name) private readonly guildMemberModel: Model<GuildMemberDocument>,
    @InjectModel(GuildRole.name) private readonly guildRoleModel: Model<GuildRoleDocument>,
    @Inject(forwardRef(() => ExternalMediaService))
    private readonly externalMediaService: ExternalMediaService,
    private readonly discordContextService: DiscordContextService,
    private readonly chatService: ChatService,
  ) {}

  async getGuilds(userId: string) {
    return this.guildMemberModel
      .aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'guilds',
            localField: 'guildId',
            foreignField: '_id',
            as: 'guilds',
          },
        },
        { $unwind: '$guilds' },
        { $replaceRoot: { newRoot: '$guilds' } },
      ])
      .exec();
  }

  async getUsersAssociatedWithUserId(userId: string) {
    const [{ memberIds = [] }] = (await this.guildMemberModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'guilds',
          localField: 'guildId',
          foreignField: '_id',
          as: 'guilds',
          pipeline: [{ $project: { _id: 1 } }],
        },
      },
      { $unwind: '$guilds' },
      { $replaceRoot: { newRoot: '$guilds' } },
      { $group: { _id: null, guildIds: { $push: '$_id' } } },
      {
        $lookup: {
          from: 'guildmembers',
          localField: 'guildIds',
          foreignField: 'guildId',
          as: 'members',
          pipeline: [{ $project: { userId: 1 } }],
        },
      },
      { $unwind: '$members' },
      {
        $group: {
          _id: null,
          guildIds: { $first: '$guildIds' },
          memberIds: { $addToSet: '$members.userId' },
        },
      },
      { $project: { _id: 0, guildIds: 1, memberIds: 1 } },
    ])) as [{ memberIds: Types.ObjectId[]; guildIds: Types.ObjectId[] }];

    return this.chatService.getOnlineList(memberIds.map((id) => id.toHexString()));
  }

  async getGuildChannels(guildId: string) {
    const guild = await this.guildModel.findById(guildId).lean();

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    return this.guildChannelModel.find({ guildId: new Types.ObjectId(guildId) }).lean();
  }

  async getGuildById(guildId: string) {
    const guild = await this.guildModel.findById(guildId).populate('members').lean();

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    return guild;
  }

  async getGuildMembers(guildId: string) {
    const guild = await this.guildModel.findById(guildId).select('_id').lean();

    if (!guild) {
      throw new NotFoundException(`Guild ${guildId} not found`);
    }

    const members = await this.guildMemberModel
      .find({ guildId: guild._id })
      .populate('user')
      .lean();

    return Promise.all(
      members.map(async (member) => {
        const [online] = await this.chatService.getOnlineList([member.userId.toHexString()]);
        console.log(online);

        return {
          ...member,
          user: member.user ? { ...member.user, online: online?.status || false } : null,
        };
      }),
    );
  }

  async getChannelById(guildId: string, channelId: string) {
    const channel = await this.guildChannelModel
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

  async acceptJoinGuild(guildId: string) {
    const { user } = this.discordContextService.get();

    const guild = await this.guildModel.findById(guildId).lean();

    if (!guild) {
      throw new NotFoundException("This post doesn't exit");
    }

    const isMemberAlready = await this.guildMemberModel
      .findOne({ userId: user._id, guildId: new Types.ObjectId(guildId) })
      .select('_id')
      .lean();

    if (isMemberAlready) {
      throw new ConflictException('This user is already member of this guild');
    }

    await this.guildMemberModel.create(
      new GuildMember({ userId: user._id, guildId: new Types.ObjectId(guildId) }),
    );

    return guild;
  }

  async createChannel(guildId: string, dto: CreateChannelDto) {
    const guild = await this.guildModel.findById(guildId).select('_id').lean();

    if (!guild) {
      throw new NotFoundException("This post doesn't exit");
    }

    return this.guildChannelModel.create({ ...dto, guildId });
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
        { session },
      );

      const guildId = guild._id;

      await Promise.all([
        this.guildChannelModel.create(
          [new GuildChannel({ guildId, name: 'general', type: GuildChannelTypes.TEXT })],
          { session },
        ),
        this.guildMemberModel.create([new GuildMember({ userId: user._id, guildId })], { session }),
        this.guildRoleModel.create(
          [new GuildRole({ guildId, permissions: 0, name: '@everyone', defaultRole: true })],
          { session },
        ),
      ]);

      return guild.populate('members');
    });
  }
}
