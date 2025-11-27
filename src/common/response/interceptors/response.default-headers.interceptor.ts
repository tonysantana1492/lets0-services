import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';

import {
  getRequestMetadata,
  setResponseHeaders,
} from '@/common/request/decorators/request.decorator';
import { IResponseDefault } from '@/common/response/interfaces/response.interface';

// only for response success and error in controller
@Injectable()
export class ResponseDefaultHeadersInterceptor implements NestInterceptor<Promise<any>> {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<any> | string>> {
    if (context.getType() === 'http') {
      const _context: HttpArgumentsHost = context.switchToHttp();
      const response: IResponseDefault = _context.getResponse();
      const request = _context.getRequest();

      const metadata = getRequestMetadata(request);

      setResponseHeaders(response, metadata);

      return next.handle();
    }

    return next.handle();
  }
}
