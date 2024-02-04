import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ChatEventsGateway } from './gateways/chat-events.gateway';
import { Socket } from 'socket.io';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly chatEventsGateway: ChatEventsGateway,
  ) {}

  async getOnlineList(userIds: string[]) {
    return this.chatEventsGateway.getOnlineList(userIds);
  }

  getUserFromSocket(socket: Socket) {
    const token = socket.handshake.auth.token as string;
    return this.userService.getUserFromToken(token);
  }
}
