import { Injectable, Logger } from '@nestjs/common';

import Stripe from 'stripe';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { CreateCheckoutSessionDto } from '@/common/stripe/dtos/create-checkout-session.dto';
import { CreatePriceDto } from '@/common/stripe/dtos/create-price.dto';
import { CreateProductDto } from '@/common/stripe/dtos/create-product.dto';
import { UpdatePriceDto } from '@/common/stripe/dtos/update-price.dto';
import { UpdateProductDto } from '@/common/stripe/dtos/update-product.dto';

@Injectable()
export class StripeService {
  private readonly logger: Logger = new Logger(StripeService.name);

  private stripeClient: Stripe;

  private relevantEvents = new Set([
    'product.created',
    'product.updated',
    'product.deleted',
    'price.created',
    'price.updated',
    'price.deleted',
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ]);

  constructor(private readonly appConfigService: AppConfigService) {
    const { secretKey, apiVersion } = this.appConfigService.stripeConfig;

    if (!secretKey) {
      throw new AppRequestException(ERROR_CODES.STRIPE_SECRET_KEY_NOT_FOUND);
    }

    this.stripeClient = new Stripe(secretKey, {
      apiVersion: apiVersion as Stripe.LatestApiVersion,
    });
  }

  async createCustomer(name: string, email: string) {
    return this.stripeClient.customers.create({ name, email });
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return await this.stripeClient.paymentIntents.retrieve(paymentIntentId);
  }

  async constructEventFromWebhook(sig: string, body: any) {
    const { webhookSecret } = this.appConfigService.stripeConfig;
    let event: Stripe.Event;

    if (!webhookSecret) throw new AppRequestException(ERROR_CODES.STRIPE_WEBHOOK_SECRET_NOT_FOUND);

    try {
      event = this.stripeClient.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.STRIPE_WEBHOOK_SECRET_NOT_FOUND,
        errors: [error],
      });
    }

    this.logger.debug(`🔔  Webhook received: ${event.type}`);

    if (!this.relevantEvents.has(event.type)) {
      throw new AppRequestException(ERROR_CODES.STRIPE_UNSUPPORTED_EVENT_TYPE);
    }

    return event;
  }

  async createSubscription(customerId: string, priceId: string, activeUsers: number) {
    return this.stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId, quantity: activeUsers }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async invoicePreview(stripeSubscriptionId: string, newPriceLookupKey: string) {
    const priceId = process.env[newPriceLookupKey.toUpperCase()];

    if (!priceId) {
      throw new AppRequestException(ERROR_CODES.INVALID_PRICE_ID);
    }

    const subscription = await this.stripeClient.subscriptions.retrieve(stripeSubscriptionId);

    if (!subscription) {
      throw new AppRequestException(ERROR_CODES.SUBSCRIPTION_NOT_FOUND);
    }

    const invoice = await this.stripeClient.invoices.retrieveUpcoming({
      customer: subscription.customer as string,
      subscription: stripeSubscriptionId,
      subscription_items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });

    return invoice;
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    return await this.stripeClient.subscriptions.deleteDiscount(stripeSubscriptionId);
  }

  async updateSubscriptionPaymentMethod(
    stripeSubscriptionId: string,
    paymentIntent: Stripe.PaymentIntent,
  ) {
    return await this.stripeClient.subscriptions.update(stripeSubscriptionId, {
      default_payment_method:
        typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : undefined,
    });
  }

  async updateSubscription(stripeSubscriptionId: string, activeUsers: number) {
    const subscription = await this.stripeClient.subscriptions.retrieve(stripeSubscriptionId);
    const itemId = subscription.items.data[0].id;
    return this.stripeClient.subscriptions.update(stripeSubscriptionId, {
      items: [{ id: itemId, quantity: activeUsers }],
    });
  }

  async subscriptions(customerId) {
    return await this.stripeClient.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
  }

  async getSubscriptionById(subscriptionId: string) {
    return await this.stripeClient.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });
  }

  async updateCustomer(paymentMethod: Stripe.PaymentMethod) {
    const customer = paymentMethod.customer as string;
    const { name, phone, address } = paymentMethod.billing_details;

    if (!name || !phone || !address) return;

    return await this.stripeClient.customers.update(customer, {
      name,
      phone,
      address: {
        ...address,
        city: address.city ?? undefined,
        country: address.country ?? undefined,
        line1: address.line1 ?? undefined,
        line2: address.line2 ?? undefined,
        postal_code: address.postal_code ?? undefined,
        state: address.state ?? undefined,
      },
    });
  }

  async createCheckoutSession({
    customerId,
    priceId,
    quantity,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionDto) {
    const session = await this.stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async createBillingPortalSession({
    stripeCustomerId,
    returnUrl,
  }: {
    stripeCustomerId: string;
    returnUrl: string;
  }) {
    const session = await this.stripeClient.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  }

  // Products
  async createProduct(dto: CreateProductDto) {
    const metadata: Record<string, string> = {};

    return this.stripeClient.products.create({
      name: dto.name,
      description: dto.description,
      active: dto.active,
      metadata,
    });
  }

  async listProducts(params?: Stripe.ProductListParams) {
    return this.stripeClient.products.list(params ?? {});
  }

  async getProductById(id: string) {
    return this.stripeClient.products.retrieve(id);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const updateData: Stripe.ProductUpdateParams = {
      name: dto.name,
      description: dto.description,
      active: dto.active,
    };

    const metadata: Record<string, string> = {};

    if (Object.keys(metadata).length) updateData.metadata = metadata;

    return this.stripeClient.products.update(id, updateData);
  }

  async deleteProduct(id: string) {
    return this.stripeClient.products.del(id);
  }

  // Prices
  async createPrice(dto: CreatePriceDto) {
    const priceData: Stripe.PriceCreateParams = {
      unit_amount: dto.unitAmount,
      currency: dto.currency,
      product: dto.productStripeId,
    };

    return this.stripeClient.prices.create(priceData);
  }

  async listPrices(params?: Stripe.PriceListParams) {
    return this.stripeClient.prices.list(params ?? {});
  }

  async getPriceById(id: string) {
    return this.stripeClient.prices.retrieve(id);
  }

  async updatePrice(id: string, dto: UpdatePriceDto) {
    return this.stripeClient.prices.update(id, {
      active: dto.active,
    } as Stripe.PriceUpdateParams);
  }

  async deletePrice(id: string) {
    return this.stripeClient.prices.update(id, { active: false } as Stripe.PriceUpdateParams);
  }
}
