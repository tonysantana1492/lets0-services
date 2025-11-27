import type { NestMiddleware } from '@nestjs/common';
import type { Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { UAParser } from 'ua-parser-js';

import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestUserAgentMiddleware implements NestMiddleware {
  async use(
    request: IRequestDefault,
    response: ExpressResponse,
    next: NextFunction,
  ): Promise<void> {
    const parserUserAgent = new UAParser(request.headers['user-agent']);
    const result = parserUserAgent.getResult();

    const osName = result.os.name ?? 'Unknown OS';
    const browserName = result.browser.name ?? 'Unknown Browser';

    const deviceInfo = `${osName} ${browserName} - ${osName}`;

    request.__userAgent = { ...result, deviceInfo };
    next();
  }
}
