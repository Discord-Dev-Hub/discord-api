import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { GuildChannelTypes } from '../constants/GuildChannelTypes';

export class CreateChannelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @ApiProperty({ enum: GuildChannelTypes, required: true })
  @IsEnum(GuildChannelTypes)
  type: GuildChannelTypes;

  constructor(data: Partial<CreateChannelDto>) {
    Object.assign(this, data);
  }
}
