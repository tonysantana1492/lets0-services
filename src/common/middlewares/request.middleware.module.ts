import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { RequestJsonBodyParserMiddleware } from '@/common/middlewares/body-parser/request.body-parser-json.middleware';
import { RequestRawBodyParserMiddleware } from '@/common/middlewares/body-parser/request.body-parser-raw.middleware';
import { RequestTextBodyParserMiddleware } from '@/common/middlewares/body-parser/request.body-parser-text.middleware';
import { RequestUrlencodedBodyParserMiddleware } from '@/common/middlewares/body-parser/request.body-parser-url-encoded.middleware';
import { RequestCookiesMiddleware } from '@/common/middlewares/cookies/request.cookies.middleware';
import { RequestCorsMiddleware } from '@/common/middlewares/cors/request.cors.middleware';
import { RequestLanguageMiddleware } from '@/common/middlewares/custom-language/request.custom-language.middleware';
import { RequestHelmetMiddleware } from '@/common/middlewares/helmet/request.helmet.middleware';
import { RequestIdMiddleware } from '@/common/middlewares/id/request.id.middleware';
import { RequestLogsMiddleware } from '@/common/middlewares/logs/request-logs.middleware';
import { RequestTimestampMiddleware } from '@/common/middlewares/timestamp/request.timestamp.middleware';
import { RequestTimezoneMiddleware } from '@/common/middlewares/timezone/request.timezone.middleware';
import { RequestUserAgentMiddleware } from '@/common/middlewares/user-agent/request.user-agent.middleware';
import { RequestVersionMiddleware } from '@/common/middlewares/version/request.version.middleware';

@Module({})
export class RequestMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        // Logs This must be de first always because has timestamp metrics
        RequestLogsMiddleware,

        // Protections
        RequestHelmetMiddleware,
        RequestCorsMiddleware,
        RequestCookiesMiddleware,

        // Convert
        RequestJsonBodyParserMiddleware,
        RequestTextBodyParserMiddleware,
        RequestRawBodyParserMiddleware,
        RequestUrlencodedBodyParserMiddleware,

        // Insert
        RequestIdMiddleware,
        RequestVersionMiddleware,
        RequestUserAgentMiddleware,
        RequestTimestampMiddleware,
        RequestTimezoneMiddleware,
        RequestLanguageMiddleware,
      )
      .forRoutes('{*splat}');
  }
}
