import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';

export type GuildDocument = Guild & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class Guild {
  @ApiProperty({ type: String, required: true, uniqueItems: true })
  @Prop({ type: Schema.Types.String, unique: true, required: true })
  name: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @Prop({ type: Schema.Types.ObjectId, required: false, nullable: true })
  mediaId: Types.ObjectId;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  ownerId: Types.ObjectId;

  constructor(data?: Partial<Guild>) {
    Object.assign(this, data);
  }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
