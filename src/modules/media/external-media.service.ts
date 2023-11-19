import { Injectable } from '@nestjs/common';

import { MediaService } from './media.service';

@Injectable()
export class ExternalMediaService {
  constructor(private readonly service: MediaService) {}

  saveFile(...params: Parameters<MediaService['saveFile']>) {
    return this.service.saveFile(...params);
  }

  getMediaUrl(...params: Parameters<MediaService['getMediaUrl']>) {
    return this.service.getMediaUrl(...params);
  }

  getMediaFromBucket(...params: Parameters<MediaService['getMediaFromBucket']>) {
    return this.service.getMediaFromBucket(...params);
  }

  getUploader(...params: Parameters<MediaService['getUploader']>) {
    return this.service.getUploader(...params);
  }
}
