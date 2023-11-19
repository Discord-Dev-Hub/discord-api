import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC } from './auth.decorator';
import { DiscordContextService } from '../context.module';
import { UserService } from '../user/user.service';
import { Jwt } from '@/utils/jwt';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly discordContext: DiscordContextService,
  ) {}

  private throw(e: any) {
    throw e;
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;

    const isPublic = this.reflector.get<boolean>(IS_PUBLIC, context.getHandler());
    const authHeader = request.header('Authorization');

    if (
      (isPublic && !authHeader) ||
      request.url === '/metrics' ||
      (request.url.match(/^\/media\/[a-f\d]{24}/) && request.method === 'GET')
    ) {
      return true;
    }

    if ((!authHeader || !authHeader.startsWith('Bearer ')) && !isPublic) {
      this.throw(new UnauthorizedException());
    }

    try {
      const authToken = authHeader.split(' ')[1];
      const token = Jwt.verify(authToken);

      if (!token?._id && !isPublic) {
        this.throw(new UnauthorizedException());
      }

      const user = await this.userService.getProfile(token._id);

      this.discordContext.set('user', user);

      if (!user && !isPublic) {
        this.throw(new NotFoundException(`User ${token._id} not found`));
      }

      return true;
    } catch (e) {
      if (!isPublic) {
        this.throw(new UnauthorizedException((e as Error)?.message));
      }
    }

    return true;
  }
}
