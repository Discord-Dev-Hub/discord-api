import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import url from 'url';

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: function (req: Request) {
    const { method, originalUrl } = req;
    const path = url.parse(originalUrl).pathname;
    const ip = req.ip;
    const key = `${method}@${path}-${ip}`;
    return key;
  },
  skip: (req) => req.method === 'GET',
});
