import { Global, Injectable, Module } from '@nestjs/common';
import { ClsModule, ClsService, ClsStore } from 'nestjs-cls';

@Injectable()
export class DiscordContextService {
  constructor(private readonly clsService: ClsService) {}

  set<T extends keyof ClsStore>(key: T, value: ClsStore[T]): void {
    this.clsService.set(key, value);
  }

  get<T extends keyof ClsStore | undefined = undefined>(
    key?: T,
  ): T extends undefined ? ClsStore : ClsStore[T] {
    return this.clsService.get(key);
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
