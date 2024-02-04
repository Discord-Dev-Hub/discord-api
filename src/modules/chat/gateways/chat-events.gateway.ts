import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { gatewayParams } from './constants';
import { OnlineUserDto } from '../dto/OnlineUserDto';
import { PresenceStatus } from '../constants/PresenceStatus';
import { RedisService } from '@/modules/redis.module';
import { ChatService } from '../chat.service';
import { Inject, forwardRef } from '@nestjs/common';

@WebSocketGateway(gatewayParams)
export class ChatEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  readonly server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(socket: Socket) {
    console.log(`Socket ${socket.id} initiated connection`);
    const user = await this.chatService.getUserFromSocket(socket);

    socket.join([user._id.toHexString()]);

    try {
      socket.emit('test', 'askdşkdsjlk');
    } catch (e) {
      socket.disconnect(false);
    }
  }

  async handleDisconnect(socket: Socket) {
    console.log(`Socket ${socket.id} initiated disconnection`);

    try {
      console.log('handleDisconnect');
    } catch (e) {
      console.log(e);
    }
  }

  async getOnlineList(userIds: string[]) {
    console.log(this.server.sockets.adapter.rooms, userIds);

    return userIds
      .filter((userId) => this.server.sockets.adapter.rooms.has(userId))
      .map((userId) => new OnlineUserDto({ userId, status: PresenceStatus.online }));
  }
}
