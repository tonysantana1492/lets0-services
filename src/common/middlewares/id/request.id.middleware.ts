import type { NestMiddleware } from '@nestjs/common';
import type { Response as ExpressRequest, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { DatabaseDefaultUUID } from '@/common/database/constants/database.function.constant';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  async use(request: IRequestDefault, response: ExpressRequest, next: NextFunction): Promise<void> {
    const uuid: string = DatabaseDefaultUUID();

    request.__id = uuid;
    next();
  }
}
