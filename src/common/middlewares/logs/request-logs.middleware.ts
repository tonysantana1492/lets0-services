import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

import { Response as ExpressResponse, NextFunction } from 'express';

import { ILogDetails } from '@/common/app-logger/interfaces/app-logger.interface';
import { getRequestMetadata } from '@/common/request/decorators/request.decorator';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestLogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: IRequestDefault, response: ExpressResponse, next: NextFunction): void {
    const start = process.hrtime();

    response.on('finish', () => {
      const { method, timestamp, ip, path, userAgent, requestId } = getRequestMetadata(request);

      const { statusCode, statusMessage } = response;

      const [seconds, nanoseconds] = process.hrtime(start);
      const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(3);

      const logDetails: ILogDetails = {
        message: statusMessage,
        context: 'HTTP',
        statusCode,
        responseCode: '',
        ip,
        path,
        userAgent,
        method,
        timestamp,
        appErrors: [],
        durationMs,
        requestId,
      };

      if (request.__exception) {
        const { message, exception, responseCode, appErrors } = request.__exception;

        logDetails.message = message;
        logDetails.context = exception?.name || 'Exception';
        logDetails.stack = exception?.stack;
        logDetails.responseCode = responseCode;
        logDetails.appErrors = appErrors;
      }

      if (statusCode >= 500) {
        this.logger.error(logDetails.message, logDetails.context, logDetails.stack, logDetails);
      } else if (statusCode >= 400) {
        this.logger.warn(logDetails.message, logDetails.context, logDetails.stack, logDetails);
      } else {
        this.logger.log(logDetails.message, logDetails.context, logDetails);
      }
    });

    next();
  }
}
