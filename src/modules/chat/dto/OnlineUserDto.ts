import { PresenceStatus } from '../constants/PresenceStatus';

export class OnlineUserDto {
  userId: string;
  status: PresenceStatus;

  constructor(dto: OnlineUserDto) {
    Object.assign(this, dto);
  }
}
