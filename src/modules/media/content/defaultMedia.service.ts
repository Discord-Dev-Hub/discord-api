import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DefaultMedia, DefaultMediaDocument } from './../entity/DefaultMedia';

@Injectable()
export class DefaultMediaService {
  constructor(
    @InjectModel(DefaultMedia.name) private readonly defaultMediaModel: Model<DefaultMediaDocument>,
  ) {}

  async getDefaultProfileCovers() {
    const doc = await this.defaultMediaModel.findOne({
      name: 'default_cover_images',
    });

    return doc.props.images || [];
  }

  async getDefaultProfileImages() {
    const doc = await this.defaultMediaModel.findOne({ name: 'default_profile_images' });

    return doc.props.images || [];
  }
}
