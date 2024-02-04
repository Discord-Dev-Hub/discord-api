import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';

export type UserDocument = User & Document;

@SchemaDecorator({ timestamps: true, toJSON: { virtuals: true } })
export class User {
  @ApiProperty({ type: String, required: true, uniqueItems: true })
  @Prop({ type: Schema.Types.String, unique: true, sparse: true, required: true })
  email: string;

  @ApiProperty({ type: String, required: true, uniqueItems: true })
  @Prop({ type: Schema.Types.String, unique: true, required: true })
  username: string;

  @ApiProperty({ type: String, required: false, default: null })
  @Prop({ type: Schema.Types.ObjectId, ref: 'img', required: false, default: null })
  avatarId: Types.ObjectId | null;

  @Prop({ type: Schema.Types.String, required: true, select: false })
  hash: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  @Prop({ type: Schema.Types.String, required: false, nullable: true })
  displayName: string;

  @ApiProperty({ type: Date, required: true })
  @Prop({ type: Schema.Types.Date, required: true })
  dateOfBirth: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
