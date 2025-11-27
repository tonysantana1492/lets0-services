import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { HelperDateService } from '../../helpers/services/helper.date.service';

@Injectable()
export class RequestTimestampInterceptor implements NestInterceptor {
  private readonly maxRequestTimestampInMs: number;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly helperDateService: HelperDateService,
  ) {
    this.maxRequestTimestampInMs = this.appConfigService.requestConfig.timestamp.toleranceTimeInMs;
  }

  /**
   * Intercepts the execution of a method in an execution context.
   *
   * @param {ExecutionContext} context - The execution context.
   * @param {CallHandler} next - The next handler in the chain.
   * @returns {Observable<any>} - An observable with the result of the intercepted method.
   * @throws {ForbiddenException} - If the request timestamp is invalid.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request: IRequestDefault = context.switchToHttp().getRequest<IRequestDefault>();
      const timestamp: number = request.__timestamp;

      const hasTimestamp: boolean = this.helperDateService.checkTimestamp(timestamp);

      if (!timestamp || !hasTimestamp)
        throw new AppRequestException(ERROR_CODES.TIME_STAMP_INVALID);

      const timestampDate: Date = this.helperDateService.create(timestamp);

      const toleranceMin: Date = this.helperDateService.backwardInMilliseconds(
        this.maxRequestTimestampInMs,
      );
      const toleranceMax: Date = this.helperDateService.forwardInMilliseconds(
        this.maxRequestTimestampInMs,
      );

      if (timestampDate < toleranceMin || timestampDate > toleranceMax) {
        throw new AppRequestException(ERROR_CODES.TIME_STAMP_INVALID);
      }
    }

    return next.handle();
  }
}
