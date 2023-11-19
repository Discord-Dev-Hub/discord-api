import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

import { User } from '@/modules/user/entity/User';

export class Metadata {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => new Types.ObjectId(value))
  submittedById: Types.ObjectId;

  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @Transform(({ value }) => new Types.ObjectId(value))
  submittedBy: User;

  constructor(data?: Partial<Metadata>) {
    Object.assign(this, data);
  }
}
