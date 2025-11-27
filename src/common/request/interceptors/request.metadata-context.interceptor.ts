import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';

import ContextService from '@/common/context/context.service';
import { getRequestMetadata } from '@/common/request/decorators/request.decorator';

@Injectable()
export class RequestMetadataContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const metadata = getRequestMetadata(request);
    this.contextService.setRequestMetadata(metadata);
    return next.handle();
  }
}
