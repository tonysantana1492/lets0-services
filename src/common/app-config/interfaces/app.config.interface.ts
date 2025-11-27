import type { ENUM_APP_ENVIRONMENT } from '@/common/app-config/enums/app.enum';
import type compression from 'compression';

export interface IAppConfigInterface {
  name: string;
  appName: string;
  env: ENUM_APP_ENVIRONMENT;
  repoVersion: string;
  language: string;
  supportEmail: string;
  appAddress: string;

  client: {
    url: string;
    supportUrl: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };

  versioning: {
    isEnabled: boolean;
    prefix: string;
    version: string;
  };
  globalPrefix: string;
  http: {
    isEnabled: boolean;
    host: string;
    port: number;
  };
  hasDocsEnabled: boolean;
  twoFactorName: string;

  compressionOptions: compression.CompressionOptions;
}
