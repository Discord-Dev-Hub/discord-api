import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Document, Schema, Types } from 'mongoose';
import { RolePermissions } from '../constants/RolePermissions';
import { enumerate } from '@/utils/enumerate';

export type GuildRoleDocument = GuildRole & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class GuildRole {
  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.ObjectId, required: true })
  guildId: Types.ObjectId;

  @ApiProperty({ type: String, required: true })
  @Prop({ type: Schema.Types.String, required: true })
  name: string;

  @ApiProperty({ type: Boolean, required: true })
  @Prop({ type: Schema.Types.Boolean, required: true })
  defaultRole: boolean;

  @ApiProperty({ enum: RolePermissions, required: false, default: 0 })
  @Prop({ type: Schema.Types.Number, required: false, default: 0 })
  permissions: number;

  constructor(data?: Partial<GuildRole>) {
    Object.assign(this, data);
  }
}

export const GuildRoleSchema = SchemaFactory.createForClass(GuildRole);
