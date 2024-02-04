import { ValidationPipe } from '@nestjs/common';
import type { GatewayMetadata } from '@nestjs/websockets';

export const gatewayParams: GatewayMetadata = {
  path: '/socketio',
  transports: ['websocket'],
  cors: { allowedHeaders: '*', credentials: false, methods: '*', origin: '*' },
};

// FIXME dtos on production build have to be spread, eg `dto = {..._dto }`, find out why and remove the spread
export const validationPipe = new ValidationPipe({
  transform: true,
  forbidNonWhitelisted: true,
  // validateCustomDecorators: true, // causes max call stack size error on prod build
  validationError: { target: true, value: true },
  transformOptions: { enableImplicitConversion: true },
});
