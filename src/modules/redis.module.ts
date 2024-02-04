import { config } from '@/injectables/config/config';
import { Global, Injectable, Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private readonly client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({
      url: config.REDIS_URL,
      socket: { reconnectStrategy: 5000, keepAlive: 500 },
      pingInterval: 5000,
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    try {
      await this.client.disconnect();
      console.log('Redis client disconnected - onModuleDestroy');
    } catch (e) {
      console.error('Failed to disconnect from redis', e);
    }
  }

  set(key: string, value: string, ttl = 60 * 60) {
    return this.client.set(key, value, { EX: ttl });
  }

  get(key: string) {
    return this.client.get(key);
  }

  getAll(keys: string[]) {
    if (keys?.length === 0) {
      return Promise.resolve([]);
    }
    return this.client.MGET(keys);
  }

  del(key: string) {
    return this.client.del(key);
  }
}

@Global()
@Module({
  imports: [],
  providers: [RedisService],
  controllers: [],
  exports: [RedisService],
})
export class RedisModule {}
