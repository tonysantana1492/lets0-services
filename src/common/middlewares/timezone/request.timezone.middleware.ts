import type { NestMiddleware } from '@nestjs/common';
import type { Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestTimezoneMiddleware implements NestMiddleware {
  async use(
    request: IRequestDefault,
    response: ExpressResponse,
    next: NextFunction,
  ): Promise<void> {
    const timezone = request.headers['x-timezone'];

    request.__timezone = timezone?.toString() ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    next();
  }
}
