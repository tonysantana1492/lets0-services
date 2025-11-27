import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppConfigService } from '@/common/app-config/app-config.service';

import { ENUM_APP_ENVIRONMENT } from './common/app-config/enums/app.enum';

export class SwaggerSetup {
  private readonly appConfigService: AppConfigService;

  private readonly logger = new Logger(SwaggerSetup.name);

  constructor(private readonly app: NestExpressApplication) {
    this.appConfigService = app.get(AppConfigService);
  }

  async setup() {
    const { env: environment, http } = this.appConfigService.appConfig;

    if (environment !== ENUM_APP_ENVIRONMENT.PRODUCTION) {
      const documentOptions = this.getDocumentOptions();
      const documentBuild = this.createDocumentBuilder(documentOptions);
      const document = this.createDocument(documentBuild);

      this.setupSwaggerUI(document, documentOptions.prefix);

      this.logSwaggerSetup(documentOptions.prefix, http.host, http.port);
    }
  }

  private getDocumentOptions() {
    const { name, description, version, prefix } = this.appConfigService.docConfig;

    return {
      name,
      description,
      version,
      prefix,
    };
  }

  private createDocumentBuilder(options: ReturnType<typeof this.getDocumentOptions>) {
    return new DocumentBuilder()
      .setTitle(options.name)
      .setDescription(options.description)
      .setVersion(options.version)
      .addServer('/')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'apiKey')
      .build();
  }

  private createDocument(documentBuild: ReturnType<typeof this.createDocumentBuilder>) {
    return SwaggerModule.createDocument(this.app, documentBuild, {
      deepScanRoutes: true,
    });
  }

  private setupSwaggerUI(document: ReturnType<typeof this.createDocument>, prefix: string) {
    SwaggerModule.setup(prefix, this.app, document, {
      jsonDocumentUrl: `${prefix}/json`,
      yamlDocumentUrl: `${prefix}/yaml`,
      explorer: true,
      customSiteTitle: document.info.title,
      swaggerOptions: {
        docExpansion: 'none',
        persistAuthorization: true,
        displayOperationId: true,
        operationsSorter: 'method',
        tagsSorter: 'alpha',
        tryItOutEnabled: true,
        filter: true,
        deepLinking: true,
      },
    });
  }

  private logSwaggerSetup(prefix: string, host: string, port: number) {
    this.logger.debug('', `======================== Docs ============================`);
    this.logger.debug(`Docs will serve on http://${host}:${port}${prefix}`);
    this.logger.debug('', `==========================================================`);
  }
}
