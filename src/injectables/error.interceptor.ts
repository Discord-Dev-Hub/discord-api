import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import axios, { AxiosError } from 'axios';

import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        Sentry.captureException(error);

        if (axios.isAxiosError(error) && error.response?.status === HttpStatus.NOT_FOUND) {
          const { message, response } = error as AxiosError;

          return throwError(() => new HttpException(message, response.status));
        }

        return throwError(() => error);
      }),
    );
  }
}
