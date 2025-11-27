import type { NestMiddleware } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import helmet from 'helmet';

@Injectable()
export class RequestHelmetMiddleware implements NestMiddleware {
  use(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void {
    helmet()(request, response, next);
  }
}
