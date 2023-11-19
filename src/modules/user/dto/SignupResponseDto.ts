import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
  @ApiProperty({ type: () => String })
  profile: any;

  @ApiProperty({ type: String })
  accessToken: string;

  constructor(data?: Partial<SignupResponseDto>) {
    Object.assign(this, data);
  }
}
