import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
    message:
      'Usernames can only contain alphanumeric characters, hyphens and underscores. Underscores and hypens are not allowed at the beginning or at the end',
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  displayName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => {
    try {
      return new Date(value);
    } catch (error) {
      return value;
    }
  })
  @IsDate()
  dateOfBirth: Date;

  constructor(data: Partial<SignupDto>) {
    Object.assign(this, data);
  }
}
