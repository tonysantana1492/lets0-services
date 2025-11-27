import type { NestMiddleware } from '@nestjs/common';
import type { Response as ExpressRequest, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { HelperDateService } from '@/common/helpers/services/helper.date.service';
import { HelperNumberService } from '@/common/helpers/services/helper.number.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestTimestampMiddleware implements NestMiddleware {
  constructor(
    private readonly helperNumberService: HelperNumberService,
    private readonly helperDateService: HelperDateService,
  ) {}

  async use(request: IRequestDefault, response: ExpressRequest, next: NextFunction): Promise<void> {
    request.__xTimestamp = request['x-timestamp']
      ? this.helperNumberService.createNumber(request['x-timestamp'])
      : undefined;

    const timestamp = this.helperDateService.timestamp();

    request.__timestamp = timestamp;
    next();
  }
}
