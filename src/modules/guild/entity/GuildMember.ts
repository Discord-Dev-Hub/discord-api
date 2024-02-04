import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Document, Schema, Types } from 'mongoose';

import { User } from '@/modules/user/entity/User';

export type GuildMemberDocument = GuildMember & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class GuildMember {
  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  guildId: Types.ObjectId;

  @ApiProperty({ type: String, required: false, default: null })
  @Prop({ type: Schema.Types.ObjectId, ref: 'img', required: false, default: null })
  avatarId: Types.ObjectId | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  @Prop({ type: Schema.Types.String, required: false, nullable: true })
  nick?: string;

  @ApiProperty({ type: User })
  user: User;

  constructor(data?: Partial<GuildMember>) {
    Object.assign(this, data);
  }
}

export const GuildMemberSchema = SchemaFactory.createForClass(GuildMember);

GuildMemberSchema.index({ guildId: -1, userId: -1 }, { name: 'guild_user_index' });

GuildMemberSchema.virtual('user', {
  ref: () => User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
