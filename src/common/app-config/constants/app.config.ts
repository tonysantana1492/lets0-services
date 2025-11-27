import type { IAppConfigInterface } from '@/common/app-config/interfaces/app.config.interface';
import { registerAs } from '@nestjs/config';

import compression from 'compression';

import { ENUM_APP_ENVIRONMENT } from '@/common/app-config/enums/app.enum';

export default registerAs(
  'app',
  (): IAppConfigInterface => ({
    appName: 'Lets0',
    name: process.env.APP_NAME ?? 'lets0-services',
    env: (process.env.NODE_ENV as ENUM_APP_ENVIRONMENT) ?? ENUM_APP_ENVIRONMENT.DEVELOPMENT,

    repoVersion: '0.1.0',
    language: process.env.LANGUAGE ?? 'en',
    supportEmail: 'admin@lets0.com',
    appAddress: '3733 NW 207th DR Miami, FL, USA',

    client: {
      url: process.env.CLIENT_URL ?? '',
      supportUrl: `${process.env.CLIENT_URL}/support`,
      privacyPolicyUrl: `${process.env.CLIENT_URL}/privacy`,
      termsOfServiceUrl: `${process.env.CLIENT_URL}/terms-of-service`,
    },

    versioning: {
      isEnabled: process.env.API_VERSIONING_ENABLE === 'true' ? true : false,
      prefix: 'v',
      version: process.env.API_VERSION ?? '1',
    },

    globalPrefix: 'api',
    http: {
      isEnabled: process.env.HTTP_ENABLE === 'true' ? true : false,
      host: process.env.HTTP_HOST ?? 'localhost',
      port: process.env.HTTP_PORT ? Number(process.env.HTTP_PORT) : 8080,
    },

    hasDocsEnabled: process.env.DOCS_ENABLED === 'true' ? true : false,

    twoFactorName: process.env.TWO_FACTOR_NAME ?? 'Lets0',

    compressionOptions: {
      level: 6,
      threshold: 1024,
      brotli: {
        enabled: true,
        zlib: { level: 6 },
      },
      filter: (req, res) => compression.filter(req, res),
    },
  }),
);
