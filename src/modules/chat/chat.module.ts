import { Module, forwardRef } from '@nestjs/common';

import { ChatEventsGateway } from './gateways/chat-events.gateway';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [ChatEventsGateway, ChatService],
  controllers: [],
  exports: [ChatService],
})
export class ChatModule {}
