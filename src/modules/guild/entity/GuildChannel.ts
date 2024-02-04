import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';

import { enumerate } from '@/utils/enumerate';
import { GuildChannelTypes } from '../constants/GuildChannelTypes';

export type GuildChannelDocument = GuildChannel & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class GuildChannel {
  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true, index: true })
  guildId: Types.ObjectId;

  @ApiProperty({ enum: GuildChannelTypes })
  @Prop({ type: Schema.Types.String, enum: enumerate(GuildChannelTypes) })
  type: GuildChannelTypes;

  constructor(data?: Partial<GuildChannel>) {
    Object.assign(this, data);
  }
}

export const GuildChannelSchema = SchemaFactory.createForClass(GuildChannel);

GuildChannelSchema.index({ _id: -1, guildId: -1 }, { name: 'channel_id_index' });
