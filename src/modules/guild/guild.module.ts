import { Module, forwardRef } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Guild, GuildSchema } from './entity/Guild';
import { MediaModule } from '../media/media.module';
import { Channel, ChannelSchema } from './entity/Channel';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guild.name, schema: GuildSchema }]),
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    forwardRef(() => MediaModule),
  ],
  controllers: [GuildController],
  providers: [GuildService],
  exports: [MongooseModule, GuildService],
})
export class GuildModule {}
