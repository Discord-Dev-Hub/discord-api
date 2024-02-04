import { UserDocument } from '@/modules/user/entity/User';

declare module 'nestjs-cls' {
  interface ClsStore {
    user?: UserDocument;
  }

  interface ClsService {
    set<T extends keyof ClsStore>(key: T, value: ClsStore[T]): void;

    get<T extends keyof ClsStore | undefined = undefined>(
      key?: T,
    ): T extends undefined ? ClsStore : ClsStore[T];
  }
}
