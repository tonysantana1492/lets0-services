import type { NestMiddleware } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import cookieParser from 'cookie-parser';

@Injectable()
export class RequestCookiesMiddleware implements NestMiddleware {
  use(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void {
    cookieParser()(request, response, next);
  }
}
