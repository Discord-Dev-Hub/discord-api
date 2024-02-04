import { config } from '@/injectables/config/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

export class RedisIOAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: config.REDIS_URL,
      socket: { reconnectStrategy: 5000, keepAlive: 5000 },
      pingInterval: 5000,
    });
    const subClient = pubClient.duplicate({
      url: config.REDIS_URL,
      socket: { reconnectStrategy: 5000, keepAlive: 5000 },
      pingInterval: 5000,
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
