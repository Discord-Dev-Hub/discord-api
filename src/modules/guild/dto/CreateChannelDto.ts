import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ChannelTypes } from '../constants/ChannelTypes';

export class CreateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @ApiProperty({ enum: ChannelTypes, required: true })
  @IsEnum(ChannelTypes)
  type: ChannelTypes;

  constructor(data: Partial<CreateChannelDto>) {
    Object.assign(this, data);
  }
}
