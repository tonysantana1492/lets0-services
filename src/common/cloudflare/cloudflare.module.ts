import { Global, Module } from '@nestjs/common';

import { TurnstileModuleAsyncOptions } from '@/common/app-config/constants/turnstile.config';

import { TurnstileModule } from './turnstile/turnstile.module';

@Global()
@Module({
  providers: [],
  exports: [TurnstileModule],
  controllers: [],
  imports: [TurnstileModule.forRootAsync(TurnstileModuleAsyncOptions)],
})
export class CloudflareModule {}
