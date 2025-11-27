import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { AppConfigService } from '@/common/app-config/app-config.service';
import appConfig from '@/common/app-config/constants/app.config';
import databaseConfig from '@/common/app-config/constants/database.config';
import docConfig from '@/common/app-config/constants/doc.config';
import emailConfig from '@/common/app-config/constants/email.config';
import googleConfig from '@/common/app-config/constants/google.config';
import jwtConfig from '@/common/app-config/constants/jwt.config';
import messageConfig from '@/common/app-config/constants/message.config';
import requestConfig from '@/common/app-config/constants/request.config';
import stripeConfig from '@/common/app-config/constants/stripe.config';
import turnstileConfig from '@/common/app-config/constants/turnstile.config';
import twilioConfig from '@/common/app-config/constants/twilio.config';
import { validate } from '@/env.validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate,
      load: [
        appConfig,
        databaseConfig,
        docConfig,
        googleConfig,
        jwtConfig,
        messageConfig,
        emailConfig,
        requestConfig,
        twilioConfig,
        stripeConfig,
        turnstileConfig,
      ],
    }),
  ],
  controllers: [],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
