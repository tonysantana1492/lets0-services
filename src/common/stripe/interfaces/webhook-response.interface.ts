export interface IStripeWebhookResponse {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: Record<string, any>;
  livemode: boolean;
  pending_webhooks: number;
  request: { id: string; idempotency_key?: string };
  type: string;
}
