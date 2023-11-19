import { UserDocument } from '@/modules/user/entity/User';

declare module 'nestjs-cls' {
  interface ClsStore {
    user?: UserDocument;
  }
}
