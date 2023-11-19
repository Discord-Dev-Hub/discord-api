import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entity/User';

export class LoginResponseDto {
  @ApiProperty({ type: () => User })
  profile: User;

  @ApiProperty()
  accessToken: string;

  constructor(data?: Partial<LoginResponseDto>) {
    Object.assign(this, data);
    delete this.profile.hash;
  }
}
