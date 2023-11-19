import { ApiProperty } from '@nestjs/swagger';

export class CreatePresignedS3UrlResponseDto {
  @ApiProperty({
    type: String,
    required: true,
    description:
      'The key of the bucket object to upload the file to, this is an exact match unique name.',
  })
  key: string;

  @ApiProperty({
    type: String,
    description:
      'The presigned URL. Call this with your file to upload that file to the bucket. Expires after 15 minutes',
  })
  presignedUrl: string;

  @ApiProperty({
    type: Object,
    description:
      'A set of key value pairs, signature and the like. They are needed to make the URL works',
  })
  fields: Record<string, string>;

  constructor(data: CreatePresignedS3UrlResponseDto) {
    this.key = data.key;
    this.presignedUrl = data.presignedUrl;
    this.fields = data.fields;
  }
}
