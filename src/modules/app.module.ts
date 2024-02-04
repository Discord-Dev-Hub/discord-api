import { Module, Scope } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';

import { APP_GUARD, APP_PIPE } from '@nestjs/core';

import { GuildModule } from './guild/guild.module';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { config } from '@/injectables/config/config';
import { DiscordValidationPipe } from '@/injectables/injectables/discord-validation.pipe';
import { DiscordContextModule } from './context.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/auth.guard';
import { MediaModule } from './media/media.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO_DB, { autoCreate: true, readPreference: 'nearest' }),
    NestjsFormDataModule.config({ isGlobal: true, storage: FileSystemStoredFile }),
    DiscordContextModule,
    RedisModule,
    MediaModule,
    UserModule,
    GuildModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: DiscordValidationPipe, scope: Scope.REQUEST },
    { provide: APP_GUARD, useClass: AuthenticationGuard },
  ],
})
export class AppModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    mongoose.connection.setClient(this.connection.getClient());
  }

  async onApplicationBootstrap() {
    await this.connection.syncIndexes({ background: true });
  }
}
