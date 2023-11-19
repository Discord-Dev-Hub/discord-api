import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '../user/user.module';
import { DefaultMediaController } from './content/defaultMedia.controller';
import { DefaultMediaService } from './content/defaultMedia.service';
import { DefaultMedia, DefaultMediaSchema } from './entity/DefaultMedia';
import { Media, MediaSchema } from './entity/Media';
import { ExternalMediaService } from './external-media.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
      { name: DefaultMedia.name, schema: DefaultMediaSchema },
    ]),
    forwardRef(() => UserModule),
  ],
  providers: [MediaService, DefaultMediaService, ExternalMediaService],
  controllers: [MediaController, DefaultMediaController],
  exports: [MongooseModule, ExternalMediaService],
})
export class MediaModule {}
