import { Global, Injectable, Module } from '@nestjs/common';
import { ClsModule, ClsService, ClsStore } from 'nestjs-cls';

@Injectable()
export class DiscordContextService {
  constructor(private readonly clsService: ClsService) {}

  set(key: keyof ClsStore, value: ClsStore['user']): void {
    this.clsService.set(key, value);
  }

  get() {
    return this.clsService.get();
  }
}

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
  ],
  providers: [DiscordContextService],
  controllers: [],
  exports: [DiscordContextService],
})
export class DiscordContextModule {}
