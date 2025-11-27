import type { NestMiddleware } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import bodyParser from 'body-parser';

import { AppConfigService } from '@/common/app-config/app-config.service';

@Injectable()
export class RequestJsonBodyParserMiddleware implements NestMiddleware {
  constructor(private readonly appConfigService: AppConfigService) {}

  use(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void {
    const {
      body: {
        json: { maxFileSize },
      },
    } = this.appConfigService.requestConfig;
    bodyParser.json({
      limit: maxFileSize,
    })(request, response, next);
  }
}
