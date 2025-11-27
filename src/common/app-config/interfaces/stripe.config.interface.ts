// import type Stripe from 'stripe';

export interface IStripeConfigInterface {
  secretKey: string;
  apiVersion: string; //Stripe.LatestApiVersion;
  webhookSecret: string;
}
