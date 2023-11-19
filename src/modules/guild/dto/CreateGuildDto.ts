import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { FileSystemStoredFile, IsFile, MaxFileSize } from 'nestjs-form-data';
export class CreateGuildDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsFile()
  @MaxFileSize(1e7, {
    message: (validationArguments) => {
      const maxSize = validationArguments.value.size;

      return `Maximum file size exceeded. File must be less than or equal to ${(
        1e7 /
        1024 /
        1024
      ).toFixed()}MB.
    Uploaded file size is ${(maxSize / 1024 / 1024).toFixed()}MB`;
    },
  })
  image?: FileSystemStoredFile;

  constructor(data: Partial<CreateGuildDto>) {
    Object.assign(this, data);
  }
}
