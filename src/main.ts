import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './modules/app.module';
import { INestApplication } from '@nestjs/common';
import { ErrorInterceptor } from './injectables/error.interceptor';
import { config } from './injectables/config/config';
import { ClsMiddleware } from 'nestjs-cls';

import { rateLimitMiddleware } from './injectables/injectables/rate-imit.middleware';
import { DiscordRequestContextMiddleware } from './injectables/injectables/discord-request-context.middleware';

function setupSwagger(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle('Discord API')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token');

  SwaggerModule.setup('openapi', app, SwaggerModule.createDocument(app, builder.build()), {
    swaggerOptions: { defaultModelsExpandDepth: -1, persistAuthorization: true },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.useGlobalInterceptors(new ErrorInterceptor());

  app.use(new ClsMiddleware({ saveReq: true, saveRes: true }).use);
  app.use(new DiscordRequestContextMiddleware().use);
  app.use(rateLimitMiddleware);

  setupSwagger(app);
  await app.listen(config.PORT);
}
bootstrap();
