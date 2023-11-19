import { ArgumentMetadata, Injectable, PipeTransform, Scope, ValidationPipe } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class DiscordValidationPipe implements PipeTransform {
  private readonly validationPipe: ValidationPipe;
  private static defaultExceptionHandler = new ValidationPipe().createExceptionFactory();

  constructor() {
    this.validationPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
      validationError: { target: true, value: true },
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        return DiscordValidationPipe.defaultExceptionHandler(errors);
      },
    });
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.validationPipe.transform(value, metadata);
  }
}
