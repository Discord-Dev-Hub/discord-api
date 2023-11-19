import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class OgImage {
  @ApiProperty()
  @IsString()
  @Expose()
  url: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  width: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  height: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  type: string;
}

export class OpenGraphDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogSiteName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogTitle: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogDescription: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogType: string;

  @ApiProperty()
  @Type(() => OgImage)
  @ValidateNested()
  @Expose()
  ogImage: OgImage;

  @ApiProperty()
  @Type(() => OgImage)
  @ValidateNested()
  @Expose()
  ogVideo: OgImage;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogLocale: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  ogDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  favicon: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Expose()
  charset: string;

  @ApiProperty()
  @IsString()
  @Expose()
  requestUrl: string;
}
