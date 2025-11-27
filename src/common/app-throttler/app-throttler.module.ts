import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { IRequestConfig } from '@/common/app-config/interfaces/request.config.interface';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: (config.get('request') as IRequestConfig).throttle.ttl,
            limit: (config.get('request') as IRequestConfig).throttle.limit,
          },
        ],
      }),
    }),
  ],
})
export class AppThrottlerModule {}
