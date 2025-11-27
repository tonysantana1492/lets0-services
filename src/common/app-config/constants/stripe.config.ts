import type { IStripeConfigInterface } from '@/common/app-config/interfaces/stripe.config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'stripe',
  (): IStripeConfigInterface => ({
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    apiVersion: '2025-01-27.acacia',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  }),
);
