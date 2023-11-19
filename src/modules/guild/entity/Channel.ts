import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';
import { ChannelTypes } from '../constants/ChannelTypes';
import { enumerate } from '@/utils/enumerate';

export type ChannelDocument = Channel & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class Channel {
  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  guildId: Types.ObjectId;

  @ApiProperty({ enum: ChannelTypes })
  @Prop({ type: Schema.Types.String, enum: enumerate(ChannelTypes) })
  type: ChannelTypes;

  constructor(data?: Partial<Channel>) {
    Object.assign(this, data);
  }
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
