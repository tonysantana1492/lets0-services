import type { IGoogleConfigInterface } from '@/common/app-config/interfaces/google.config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'google',
  (): IGoogleConfigInterface => ({
    projectId: process.env.GCP_PROJECT_ID ?? '',

    clientId: process.env.SSO_GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.SSO_GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.SSO_GOOGLE_CALLBACK_URL ?? '',

    accessType: 'offline',
    scope: ['email', 'profile'],

    pubSub: {
      topic: 'lets0-topic',
      emulatorPort: process.env.GCP_PUBSUB_EMULATOR_PORT
        ? Number(process.env.GCP_PUBSUB_EMULATOR_PORT)
        : 8085,
      auth: {
        keyFilename: process.env.GCP_PUBSUB_KEY_FILENAME ?? '',
        projectId: process.env.GCP_PROJECT_ID ?? '',
      },
    },

    places: {
      apiKey: process.env.GCP_PLACES_API_KEY ?? '',
    },

    storage: {
      keyFilename: process.env.GCP_KEY_STORAGE_FILENAME ?? '',
      projectId: process.env.GCP_PROJECT_ID ?? '',
      bucketName: process.env.GCP_BUCKET_NAME ?? '',
    },

    recaptcha: {
      secret: process.env.RECAPTCHA_SECRET_KEY ?? '',
      url: 'https://www.google.com/recaptcha/api/siteverify',
    },

    gmailAccountClientId: process.env.SSO_EMAIL_ACCOUNT_CLIENT_ID ?? '',
    gmailAccountClientSecret: process.env.SSO_EMAIL_ACCOUNT_CLIENT_SECRET ?? '',
    gmailAccountCallbackUrl: process.env.SSO_EMAIL_ACCOUNT_CALLBACK_URL ?? '',
    gmailAccountAccessType: 'offline',
    gmailAccountScope: [
      'https://mail.google.com/',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
    ],
    gmailAccountPageSizeDefault: 10,
  }),
);
