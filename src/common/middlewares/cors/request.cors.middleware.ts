import type { NestMiddleware } from '@nestjs/common';
import type { CorsOptions } from 'cors';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { HttpStatus, Injectable } from '@nestjs/common';

import cors from 'cors';

import { AppConfigService } from '@/common/app-config/app-config.service';

@Injectable()
export class RequestCorsMiddleware implements NestMiddleware {
  constructor(private readonly appConfigService: AppConfigService) {}

  use(request: ExpressRequest, response: ExpressResponse, next: NextFunction): void {
    const {
      cors: { allowOrigin, allowMethod, allowHeader },
    } = this.appConfigService.requestConfig;

    const corsOptions: CorsOptions = {
      origin: allowOrigin,
      methods: allowMethod,
      allowedHeaders: allowHeader,
      preflightContinue: false,
      credentials: true,
      optionsSuccessStatus: HttpStatus.NO_CONTENT,
    };

    cors(corsOptions)(request, response, next);
  }
}
