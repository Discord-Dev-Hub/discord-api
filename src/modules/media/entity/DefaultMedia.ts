import { Prop, Schema as SchemaDecorator, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Schema } from 'mongoose';

export type DefaultMediaDocument = DefaultMedia & Document;

@SchemaDecorator({
  collection: 'contents',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
})
export class DefaultMedia {
  @ApiProperty()
  @Prop({ type: Schema.Types.String, required: true })
  name: string;

  @ApiProperty()
  @Prop({ type: Schema.Types.Mixed, required: true })
  props: { images: string[] };

  @ApiProperty()
  @Prop({ type: Schema.Types.String, required: true })
  lang: string;

  @ApiProperty()
  @Prop({ type: Schema.Types.Boolean, default: true })
  active: boolean;
}

export const DefaultMediaSchema = SchemaFactory.createForClass(DefaultMedia);
