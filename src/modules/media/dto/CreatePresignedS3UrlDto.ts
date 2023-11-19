import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { SupportedVideoTypes } from '../constants/SupportedVideoTypes';

export class CreatePresignedS3UrlDto {
  @ApiProperty({ enum: SupportedVideoTypes, required: true })
  @IsEnum(SupportedVideoTypes)
  contentType: SupportedVideoTypes;

  @ApiProperty({ type: String, required: true, description: 'file name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
