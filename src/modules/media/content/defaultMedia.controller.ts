import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PublicEndpoint } from '../../auth/auth.decorator';
import { DefaultMediaService } from './defaultMedia.service';

@Controller()
@ApiTags('default-media')
export class DefaultMediaController {
  constructor(private readonly service: DefaultMediaService) {}

  @Get('/content/default_cover_images')
  @PublicEndpoint()
  oldGetDefaultCoverImages() {
    return this.service.getDefaultProfileCovers();
  }

  @Get('/content/default_profile_images')
  @PublicEndpoint()
  oldGetDefaultProfileImages() {
    return this.service.getDefaultProfileImages();
  }

  @Get('/media/defaults/cover-images')
  @PublicEndpoint()
  getDefaultCoverImages() {
    return this.service.getDefaultProfileCovers();
  }

  @Get('/media/defaults/profile-images')
  @PublicEndpoint()
  getDefaultProfileImages() {
    return this.service.getDefaultProfileImages();
  }
}
