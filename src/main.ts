import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import compression from 'compression';

import { AppModule } from '@/app.module';
import { AppConfigService } from '@/common/app-config/app-config.service';
import { AppLoggerService } from '@/common/app-logger/app-logger.service';
import { SwaggerSetup } from '@/swagger.setup';

import { ENUM_APP_ENVIRONMENT } from './common/app-config/enums/app.enum';
import { InternalDisabledLogger } from './common/app-logger/internal-disabled.logger';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new InternalDisabledLogger(),
    rawBody: true,
  });

  const configService = app.get(AppConfigService);

  const { env, http, hasDocsEnabled, versioning, name, compressionOptions } =
    configService.appConfig;

  app.useLogger(app.get(AppLoggerService));

  app.use(compression(compressionOptions));

  const logger = new Logger('App');

  // Versioning
  const { isEnabled, version, prefix } = versioning;

  if (isEnabled) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: version,
      prefix,
    });
  }

  // Swagger
  if (hasDocsEnabled) {
    const swaggerSetup = new SwaggerSetup(app);
    await swaggerSetup.setup();
  }

  // Starts listening for shutdown hooks

  if (env !== ENUM_APP_ENVIRONMENT.DEVELOPMENT) {
    app.enableShutdownHooks();
  }

  // Listen
  const { port, host } = http;
  await app.listen(port, host);

  logger.debug('', `================= ${name.toUpperCase()} =================`);
  // logger.debug('', `================== NestApplication [ENV VARIABLES] ==================`);

  // Logs envs variables

  // if (env === ENUM_APP_ENVIRONMENT.LOCAL) {
  //   logger.debug(structuredClone(process.env), 'ENV VARIABLES');
  // }

  logger.debug(`Http versioning is ${isEnabled}`, name.toUpperCase());
  logger.debug(`Http Server running on  http://${host}:${port}`, name.toUpperCase());
  logger.debug('', `=====================================================================`);

  return app;
}

void bootstrap();
