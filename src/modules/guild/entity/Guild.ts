import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';
import { GuildMember } from './GuildMember';

export type GuildDocument = Guild & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class Guild {
  @ApiProperty({ type: String, required: true, uniqueItems: true })
  @Prop({ type: Schema.Types.String, required: true })
  name: string;

  @ApiProperty({ type: String, required: false, default: null })
  @Prop({ type: Schema.Types.ObjectId, ref: 'img', required: false, default: null })
  mediaId: Types.ObjectId | null;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  ownerId: Types.ObjectId;

  @ApiProperty({ type: [GuildMember], nullable: true, isArray: true })
  members?: [GuildMember];

  constructor(data?: Partial<Guild>) {
    Object.assign(this, data);
  }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);

GuildSchema.virtual('members', {
  ref: () => GuildMember.name,
  localField: '_id',
  foreignField: 'guildId',
  limit: 100,
});
