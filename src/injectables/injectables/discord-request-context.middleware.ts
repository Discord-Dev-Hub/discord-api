import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';

import { v4 as uuid } from 'uuid';

export class DiscordRequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingCorrelationId = req.header('discord-correlation-id');
    const correlationId = existingCorrelationId || uuid();

    if (isEmpty(existingCorrelationId)) {
      req.headers['discord-correlation-id'] = correlationId;
      res.setHeader('discord-correlation-id', correlationId);
    }

    next();
  }
}
