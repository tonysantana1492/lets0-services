import type { IMailOptions } from '@/common/email/interfaces/gmail.interface';

export interface IGoogleAuth {
  keyFilename: string;
  projectId: string;
}

export interface IGooglePubSubConfig {
  topic: string;
  auth: IGoogleAuth;
}

export interface IGoogleStorageConfig extends IGoogleAuth {
  bucketName: string;
}

export interface IGoogleGmailAuthConfig {
  keyFile: string;
  scopes: string[];
  subject: string;
}

export interface IGooglePlacesConfig {
  apiKey: string;
}

export interface IGoogleGmailConfig {
  supportEmail: string;
  auth: IGoogleGmailAuthConfig;
  mailOptions: IMailOptions;
}

export interface IGoogleConfigInterface {
  projectId: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;

  accessType: string;
  scope: string[];

  pubSub: {
    topic: string;
    emulatorPort?: number;
    auth: {
      keyFilename: string;
      projectId: string;
    };
  };

  recaptcha: {
    secret: string;
    url: string;
  };

  places: {
    apiKey: string;
  };

  storage: {
    keyFilename: string;
    projectId: string;
    bucketName: string;
  };

  gmailAccountClientId: string;
  gmailAccountClientSecret: string;
  gmailAccountCallbackUrl: string;
  gmailAccountAccessType: string;
  gmailAccountScope: string[];
  gmailAccountPageSizeDefault: number;
}
