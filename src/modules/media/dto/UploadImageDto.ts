import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { FileSystemStoredFile, HasMimeType, IsFile, MaxFileSize } from 'nestjs-form-data';
import { getSupportedImagesTypes } from '../constants/SupportedImageTypes';

const types = getSupportedImagesTypes();

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  @IsFile()
  @MaxFileSize(1e7, {
    message: (validationArguments) => {
      const maxSize = validationArguments.value.size;
      const MB_SIZE = 1e7 / 1024 / 1024;

      return `Maximum file size exceeded. File must be less than or equal to ${MB_SIZE.toFixed()}MB.
    Uploaded file size is ${(maxSize / 1024 / 1024).toFixed()}MB`;
    },
  })
  @HasMimeType(types, {
    each: true,
    message: `The image(s) you are attempting to upload is not supported by us, we only accept "${types
      .join(', ')
      .toLowerCase()}"`,
  })
  img?: FileSystemStoredFile;

  constructor(data: Partial<UploadImageDto>) {
    Object.assign(this, data);
  }
}
