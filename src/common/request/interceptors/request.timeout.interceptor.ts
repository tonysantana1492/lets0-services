import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import ms from 'ms';
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

import {
  REQUEST_CUSTOM_TIMEOUT_META_KEY,
  REQUEST_CUSTOM_TIMEOUT_VALUE_META_KEY,
} from '../constants/request.constant';

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
  private readonly maxTimeoutInSecond: number;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly reflector: Reflector,
  ) {
    this.maxTimeoutInSecond = this.appConfigService.requestConfig.timeout;
  }

  /**
   * Intercepts the execution context and handles the request.
   *
   * @param {ExecutionContext} context - The execution context.
   * @param {CallHandler} next - The next handler in the chain.
   * @returns {Observable<any>} - The result of handling the request.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const isCustomTimeout = this.reflector.get(
        REQUEST_CUSTOM_TIMEOUT_META_KEY,
        context.getHandler(),
      );

      const timeoutMS = isCustomTimeout
        ? ms(this.reflector.get(REQUEST_CUSTOM_TIMEOUT_VALUE_META_KEY, context.getHandler()))
        : this.maxTimeoutInSecond * 1000;

      return next.handle().pipe(
        timeout(Number(timeoutMS)),
        catchError((error: Error) => {
          if (error instanceof TimeoutError)
            throw new AppRequestException({
              ...ERROR_CODES.HTTP_REQUEST_TIME_OUT,
              errors: [error],
            });

          return throwError(() => error);
        }),
      );
    }

    return next.handle();
  }
}
