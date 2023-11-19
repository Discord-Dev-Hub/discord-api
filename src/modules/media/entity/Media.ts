import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema, Types } from 'mongoose';

import { User, UserDocument } from '@/modules/user/entity/User';

export type MediaDocument = Media & Document;

@SchemaDecorator({
  collection: 'imgs',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
})
export class Media {
  @ApiProperty()
  @Prop({ type: Schema.Types.String, default: '' })
  name: string;

  @ApiProperty()
  @Prop({ type: Schema.Types.String, default: '' })
  thumbnail: string;

  @ApiProperty()
  @Prop({ type: Schema.Types.String, default: '' })
  mimetype: string;

  @ApiProperty()
  @Prop({ type: Schema.Types.Boolean, default: true })
  active: boolean;

  @ApiProperty({ type: String })
  @Prop({ type: Schema.Types.ObjectId, ref: User.name })
  submittedBy: Types.ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: Schema.Types.ObjectId })
  mini: Types.ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: Schema.Types.ObjectId })
  small: Types.ObjectId;

  @ApiProperty({ type: String })
  @Prop({ type: Schema.Types.ObjectId })
  medium: Types.ObjectId;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: () => User })
  uploader?: UserDocument;

  constructor(data: Partial<Media>) {
    Object.assign(this, data);
  }
}

export const MediaSchema = SchemaFactory.createForClass(Media);

MediaSchema.virtual('uploader', {
  ref: () => User.name,
  localField: 'submittedBy',
  foreignField: '_id',
  justOne: true,
});
