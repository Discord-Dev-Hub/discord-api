import { Module, forwardRef } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './entity/Guild';
import { MediaModule } from '../media/media.module';
import { GuildChannel, GuildChannelSchema } from './entity/GuildChannel';
import { GuildMember, GuildMemberSchema } from './entity/GuildMember';
import { GuildRole, GuildRoleSchema } from './entity/GuildRole';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
      { name: GuildChannel.name, schema: GuildChannelSchema },
      { name: GuildMember.name, schema: GuildMemberSchema },
      { name: GuildRole.name, schema: GuildRoleSchema },
    ]),

    forwardRef(() => ChatModule),
    forwardRef(() => MediaModule),
  ],
  controllers: [GuildController],
  providers: [GuildService],
  exports: [MongooseModule, GuildService],
})
export class GuildModule {}
