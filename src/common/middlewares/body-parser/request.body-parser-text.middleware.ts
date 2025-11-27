import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import bodyParser from 'body-parser';

import { IRequestConfig } from '@/common/app-config/interfaces/request.config.interface';

@Injectable()
export class RequestTextBodyParserMiddleware implements NestMiddleware {
  private readonly maxFile: number;

  constructor(private readonly configService: ConfigService) {
    this.maxFile = (this.configService.get('request') as IRequestConfig).body.text.maxFileSize;
  }

  use(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void {
    bodyParser.text({
      limit: this.maxFile,
    })(request, response, next);
  }
}
