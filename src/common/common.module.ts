import { HttpStatus, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppConfigModule } from '@/common/app-config/app-config.module';
import { AppThrottlerModule } from '@/common/app-throttler/app-throttler.module';
import { ContextModule } from '@/common/context/context.module';

import { AccountConfigModule } from './account-config/account-config.module';
import { LoggerModule } from './app-logger/app-logger.module';
import { MfaModule } from './auth-mfa/mfa.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { ProtectedGuard } from './authorization/guards/protected.guard';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { DatabaseModule } from './database/database.module';
import { EmailSchedulingModule } from './email-scheduling/email-scheduling.module';
import { EmailModule } from './email/email.module';
import { ERROR_CODES } from './error/constants/error-code';
import { ErrorModule } from './error/error.module';
import { AppRequestException } from './error/exceptions/app-request.exception';
import { GoogleModule } from './google/google.module';
import { HelperModule } from './helpers/helper.module';
import { LanguageModule } from './language/language.module';
import { RequestMiddlewareModule } from './middlewares/request.middleware.module';
import { NotificationMethodModule } from './notification-method/notification-method.module';
import { NotificationModule } from './notification/notification.module';
import { PaginationModule } from './pagination/pagination.module';
import { RequestModule } from './request/request.module';
import { ResponseExceptionFilter } from './response/filters/response.exception.filter';
import { ResponseDefaultHeadersInterceptor } from './response/interceptors/response.default-headers.interceptor';
import { ResponseDefaultInterceptor } from './response/interceptors/response.default.interceptor';
import { ResponseModule } from './response/response.module';
import { BillingModule } from './stripe/billing.module';
import { TwilioModule } from './twilio/twilio.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    // ⚙️ Configuration and Utility Modules
    ScheduleModule.forRoot(),
    JwtModule.register({ global: true }),
    AppConfigModule,
    AppThrottlerModule,
    ContextModule,

    // 🧱 Infrastructure Modules
    DatabaseModule,
    LoggerModule,
    HelperModule,
    ErrorModule,
    ResponseModule,
    RequestModule,
    RequestMiddlewareModule,

    // 🔐 Authentication and Authorization Modules
    AuthModule,
    MfaModule,
    AuthorizationModule,
    AccountConfigModule,

    // 📧 Communication and Notification Modules
    EmailModule,
    EmailSchedulingModule,
    NotificationModule,
    NotificationMethodModule,
    TwilioModule,

    // 🌐 External Integration Modules
    GoogleModule,
    CloudflareModule,
    BillingModule,

    /// 👥 Domain and Feature Modules
    UserModule,
    WorkspaceModule,
    PaginationModule,
    LanguageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ProtectedGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ResponseExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseDefaultInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseDefaultHeadersInterceptor,
    },

    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
          skipNullProperties: false,
          skipUndefinedProperties: false,
          skipMissingProperties: false,
          forbidUnknownValues: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: async (errors: ValidationError[]) =>
            new AppRequestException({ ...ERROR_CODES.REQUEST_VALIDATION_PARAMS, errors }),
        }),
    },
  ],
})
export class CommonModule {}
