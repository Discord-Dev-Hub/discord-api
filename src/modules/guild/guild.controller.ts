import { ApiBody, ApiConsumes, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GuildService } from './guild.service';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';

import { CreateGuildDto } from './dto/CreateGuildDto';
import { FormDataRequest } from 'nestjs-form-data';
import { Guild } from './entity/Guild';
import { CreateChannelDto } from './dto/CreateChannelDto';
import { Channel } from './entity/Channel';

@Controller('guilds')
@ApiTags('guilds')
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGuildDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: Guild })
  @FormDataRequest()
  createGuild(@Body() dto: CreateGuildDto) {
    return this.guildService.createGuild(dto);
  }

  @Post('/:guildId/channels')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'guildId', type: String, required: true })
  @ApiBody({ type: CreateChannelDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: Channel })
  @FormDataRequest()
  createChannel(@Param('guildId') guildId: string, @Body() dto: CreateChannelDto) {
    return this.guildService.createChannel(guildId, dto);
  }

  @Get('/:guildId/channels')
  @ApiParam({ name: 'guildId', type: String, required: true })
  @ApiResponse({ status: HttpStatus.CREATED, type: [Channel] })
  getGuildChannels(@Param('guildId') guildId: string) {
    return this.guildService.getGuildChannels(guildId);
  }

  @Get('/:guildId/channels/:channelId')
  @ApiParam({ name: 'guildId', type: String, required: true })
  @ApiParam({ name: 'channelId', type: String, required: true })
  @ApiResponse({ status: HttpStatus.CREATED, type: Channel })
  getChannelById(@Param('guildId') guildId: string, @Param('channelId') channelId: string) {
    return this.guildService.getChannelById(guildId, channelId);
  }

  @Get('/:guildId')
  @ApiParam({ name: 'guildId', type: String, required: true })
  @ApiResponse({ status: HttpStatus.CREATED, type: Guild })
  getGuildById(@Param('guildId') guildId: string) {
    return this.guildService.getGuildById(guildId);
  }
}
