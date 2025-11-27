import { Module } from '@nestjs/common';

import { ResponseDefaultHeadersInterceptor } from './interceptors/response.default-headers.interceptor';
import { ResponseDefaultInterceptor } from './interceptors/response.default.interceptor';

@Module({
  controllers: [],
  providers: [ResponseDefaultInterceptor, ResponseDefaultHeadersInterceptor],
  exports: [ResponseDefaultInterceptor, ResponseDefaultHeadersInterceptor],
})
export class ResponseModule {}
