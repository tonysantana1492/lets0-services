import type { ITwilioConfig } from '@/common/app-config/interfaces/twilio.config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'twilio',
  (): ITwilioConfig => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    number: process.env.TWILIO_NUMBER ?? '',
  }),
);
