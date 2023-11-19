import { config } from '@/injectables/config/config';
import jwt from 'jsonwebtoken';

export class Jwt {
  static sign(userId: string) {
    return jwt.sign({ _id: userId }, config.SECRET, {
      expiresIn: '7d',
    });
  }

  static verify(token: string) {
    return jwt.verify(token, config.SECRET, { ignoreExpiration: false }) as { _id: string };
  }
}
