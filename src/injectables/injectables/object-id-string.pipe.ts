import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isObjectIdOrHexString } from 'mongoose';

@Injectable()
export class ObjectIdStringPipe implements PipeTransform<any, string> {
  transform(value: any) {
    if (!isObjectIdOrHexString(value)) {
      throw new BadRequestException(`${value} is not a valid object id`);
    }
    return value;
  }
}
