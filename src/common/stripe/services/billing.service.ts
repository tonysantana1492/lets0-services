import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Types } from 'mongoose';
import Stripe from 'stripe';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { CreateCheckoutSessionDto } from '@/common/stripe/dtos/create-checkout-session.dto';
import { CreatePriceDto } from '@/common/stripe/dtos/create-price.dto';
import { CreateProductDto } from '@/common/stripe/dtos/create-product.dto';
import { UpdatePriceDto } from '@/common/stripe/dtos/update-price.dto';
import { UpdateProductDto } from '@/common/stripe/dtos/update-product.dto';
import { PriceCollectionName } from '@/common/stripe/repository/entity/price.entity';
import { UserService } from '@/common/user/user.service';
import { WorkspaceService } from '@/common/workspace/workspace.service';

import { PriceModel } from '../repository/models/price.model';
import { ProductModel } from '../repository/models/product.model';
import { SubscriptionModel } from '../repository/models/subscription.model';
import { StripeService } from './stripe.service';

export const TRIAL_PERIOD_DAYS = 0;

@Injectable()
export class BillingService {
  private readonly logger: Logger = new Logger(BillingService.name);

  constructor(
    private readonly userService: UserService,
    private readonly stripeService: StripeService,
    private readonly workspaceService: WorkspaceService,
    private readonly productModel: ProductModel,
    private readonly priceModel: PriceModel,
    private readonly subscriptionModel: SubscriptionModel,
    // @InjectQueue('subscription-updates') private subscriptionQueue: Queue,
  ) {}

  async createSubscription(workspaceId: string, priceId: string) {
    const company = await this.workspaceService.findById(workspaceId);
    const activeUsers = await this.userService.countActiveUsers(workspaceId);
    const subscription = await this.stripeService.createSubscription(
      company.stripeCustomerId,
      priceId,
      activeUsers,
    );

    return await this.stripeService.updateSubscription(subscription.id, activeUsers);
  }

  async updateSubscription(workspaceId: string) {
    const subscription = await this.subscriptionModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!subscription) throw new AppRequestException(ERROR_CODES.DATABASE_ERROR);

    const activeUsers = await this.userService.countActiveUsers(workspaceId);
    if (activeUsers === subscription.quantity) return;

    await this.stripeService.updateSubscription(subscription.stripeSubscriptionId, activeUsers);

    return await this.subscriptionModel.updateOne(
      {
        _id: subscription._id,
      },
      { quantity: activeUsers },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async reconcileSubscriptions() {
    const subscriptions = await this.subscriptionModel.findAll({
      status: 'active',
    });

    for (const subscription of subscriptions) {
      // eslint-disable-next-line no-console
      console.log('subscription', subscription);
      //   // await this.subscriptionQueue.add('reconcile', { workspaceId: subscription.workspaceId });
    }

    this.logger.log('Scheduled daily subscription reconciliation');
  }

  async processSubscriptionUpdate(job: any) {
    const { workspaceId } = job.data;
    await this.updateSubscription(workspaceId);
  }

  private toDateTime(secs: number) {
    const t = new Date(+0);
    t.setSeconds(secs);
    return t;
  }

  async handleWebhook(sig: string, body: any) {
    const event = await this.stripeService.constructEventFromWebhook(sig, body);

    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated': {
          await this.upsertProduct(event.data.object);
          break;
        }

        case 'price.created':
        case 'price.updated': {
          await this.upsertPrice(event.data.object);
          break;
        }

        case 'price.deleted': {
          await this.deletePrice(event.data.object.id);
          break;
        }

        case 'product.deleted': {
          await this.deleteProduct(event.data.object.id);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await this.manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created',
          );
          break;
        }

        case 'checkout.session.completed': {
          const checkoutSession = event.data.object;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await this.manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true,
            );
          }

          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          if (invoice.billing_reason === 'subscription_create') {
            // The subscription automatically activates after successful payment
            // Set the payment method used to pay the first invoice
            // as the default payment method for that subscription
            const subscription_id = invoice.subscription;
            const payment_intent_id = invoice.payment_intent;

            // Retrieve the payment intent used to pay the subscription
            if (typeof payment_intent_id !== 'string') {
              throw new AppRequestException(ERROR_CODES.INVALID_PAYMENT_INTENT_ID);
            }

            const payment_intent =
              await this.stripeService.retrievePaymentIntent(payment_intent_id);

            if (typeof subscription_id !== 'string') {
              throw new AppRequestException(ERROR_CODES.INVALID_SUBSCRIPTION_ID);
            }

            await this.stripeService.updateSubscriptionPaymentMethod(
              subscription_id,
              payment_intent,
            );
          }

          break;
        }

        case 'invoice.payment_failed': {
          // If the payment fails or the customer does not have a valid payment method,
          //  an invoice.payment_failed event is sent, the subscription becomes past_due.
          // Use this webhook to notify your user that their payment has
          // failed and to retrieve new card details.
          break;
        }

        case 'invoice.finalized': {
          // If you want to manually send out invoices to your customers
          // or store them locally to reference to avoid hitting Stripe rate limits.
          break;
        }

        case 'customer.subscription.trial_will_end': {
          // Send notification to your user that the trial will end
          break;
        }

        default: {
          throw new AppRequestException(ERROR_CODES.STRIPE_UNSUPPORTED_EVENT_TYPE);
        }
      }
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.STRIPE_WEBHOOK_ERROR, errors: [error] });
    }
  }

  private async copyBillingDetailsToCustomer(
    workspaceId: Types.ObjectId,
    paymentMethod: Stripe.PaymentMethod,
  ) {
    await this.stripeService.updateCustomer(paymentMethod);

    const { address } = paymentMethod.billing_details;
    try {
      return await this.workspaceService.updateOne(
        { _id: new Types.ObjectId(workspaceId) },
        {
          billingAddress: { ...address },
          paymentMethod: { ...paymentMethod[paymentMethod.type] },
        },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  private async manageSubscriptionStatusChange(
    subscriptionId: string,
    stripeCustomerId: string,
    createAction = false,
  ) {
    const workspace = await this.workspaceService.findByStripeCustomerId(stripeCustomerId);

    if (!workspace._id) throw new AppRequestException(ERROR_CODES.USER_NOT_FOUND);

    const subscription = await this.stripeService.getSubscriptionById(subscriptionId);

    try {
      await this.subscriptionModel.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          workspaceId: workspace._id,
          metadata: subscription.metadata,
          status: subscription.status,
          priceId: subscription.items.data[0].price.id,
          quantity: subscription.items.data[0].quantity,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at
            ? this.toDateTime(subscription.cancel_at).toISOString()
            : undefined,
          canceledAt: subscription.canceled_at
            ? this.toDateTime(subscription.canceled_at).toISOString()
            : undefined,
          currentPeriodStart: this.toDateTime(subscription.current_period_start).toISOString(),
          currentPeriodEnd: this.toDateTime(subscription.current_period_end).toISOString(),
          created: this.toDateTime(subscription.created).toISOString(),
          endedAt: subscription.ended_at
            ? this.toDateTime(subscription.ended_at).toISOString()
            : undefined,
          trialStart: subscription.trial_start
            ? this.toDateTime(subscription.trial_start).toISOString()
            : undefined,
          trialEnd: subscription.trial_end
            ? this.toDateTime(subscription.trial_end).toISOString()
            : undefined,
        },
        {
          upsert: true,
        },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }

    // For a new subscription copy the billing details to the customer object.
    if (createAction && subscription.default_payment_method && workspace) {
      await this.copyBillingDetailsToCustomer(
        workspace._id,
        subscription.default_payment_method as Stripe.PaymentMethod,
      );
    }
  }

  // Product
  private async upsertProduct(product: Stripe.Product) {
    try {
      return await this.productModel.updateOne(
        { productStripeId: product.id },
        {
          productStripeId: product.id,
          active: product.active,
          name: product.name,
          description: product.description ?? undefined,
          image: product.images?.[0] ?? null,
          metadata: product.metadata,
        },
        {
          upsert: true,
        },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async deleteProduct(productId: string) {
    try {
      await this.stripeService.deleteProduct(productId);
      return await this.productModel.deleteOne({ productStripeId: productId });
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  // Price
  private async upsertPrice(price: Stripe.Price) {
    try {
      return await this.priceModel.updateOne(
        { priceStripeId: price.id },
        {
          priceStripeId: price.id,
          productStripeId: typeof price.product === 'string' ? price.product : '',
          active: price.active,
          currency: price.currency,
          type: price.type,
          unitAmount: price.unit_amount ?? undefined,
          interval: price.recurring?.interval ?? undefined,
          intervalCount: price.recurring?.interval_count ?? undefined,
          trialPeriodDays: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
        },
        {
          upsert: true,
        },
      );
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async deletePrice(priceId: string) {
    try {
      await this.stripeService.deletePrice(priceId);
      return await this.priceModel.deleteOne({ priceStripeId: priceId });
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async getProducts() {
    try {
      return await this.productModel.pipeline([
        {
          $match: { active: true }, // Filter only active products
        },
        {
          $lookup: {
            from: PriceCollectionName,
            localField: 'productId',
            foreignField: 'productId',
            as: 'prices',
          },
        },
        {
          $set: {
            prices: {
              $filter: {
                input: '$prices',
                as: 'price',
                cond: { $eq: ['$$price.active', true] },
              },
            },
          },
        },
        {
          $set: {
            prices: {
              $sortArray: { input: '$prices', sortBy: { unitAmount: 1 } },
            },
          },
        },
        {
          $addFields: {
            firstPrice: { $arrayElemAt: ['$prices.unitAmount', 0] }, // Extract the first price
          },
        },
        {
          $sort: { firstPrice: 1 }, // Sort by the first price
        },
        {
          $project: { firstPrice: 0 }, // Remove temporary field
        },
      ]);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async getSubscriptions() {
    try {
      return await this.subscriptionModel.pipeline([
        {
          $match: {
            status: { $in: ['trialing', 'active'] },
          },
        },
        {
          $lookup: {
            from: 'prices',
            localField: 'priceId',
            foreignField: 'priceId',
            as: 'prices',
          },
        },
        {
          $unwind: '$prices',
        },
        {
          $lookup: {
            from: 'products',
            localField: 'prices.productId',
            foreignField: 'productId',
            as: 'prices.product',
          },
        },
        {
          $unwind: '$prices.product',
        },
        {
          $limit: 1,
        },
      ]);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async getPlans() {
    try {
      return await this.priceModel.pipeline([
        { $match: { active: true } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: 'productId',
            as: 'product',
          },
        },
        { $unwind: '$product' },
        {
          $project: {
            priceId: 1,
            productId: 1,
            unitAmount: 1,
            currency: 1,
            type: 1,
            interval: 1,
            intervalCount: 1,
            trialPeriodDays: 1,
            product: {
              name: '$product.name',
              description: '$product.description',
              image: '$product.image',
            },
          },
        },
        { $sort: { unitAmount: 1 } },
      ]);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async getStatus({ workspaceId }: { workspaceId: string }) {
    try {
      if (workspaceId) {
        const subscription = await this.subscriptionModel.findOne({
          workspaceId: new Types.ObjectId(workspaceId),
        });
        return subscription ?? null;
      }

      const workspace = await this.workspaceService.findById(workspaceId);
      if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

      const subscription = await this.subscriptionModel.findOne({ workspaceId: workspace._id });
      return subscription ?? null;
    } catch (error) {
      if (error instanceof AppRequestException) throw error;
      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  public async createPortalSession({
    workspaceId,
    returnUrl,
  }: {
    workspaceId?: string;
    returnUrl: string;
  }) {
    try {
      if (!returnUrl) throw new AppRequestException(ERROR_CODES.INVALID_PARAMS);

      if (!workspaceId) throw new AppRequestException(ERROR_CODES.INVALID_PARAMS);

      const workspace = await this.workspaceService.findById(workspaceId);
      if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

      if (!workspace.stripeCustomerId)
        throw new AppRequestException(ERROR_CODES.STRIPE_SECRET_KEY_NOT_FOUND);

      const session = await this.stripeService.createBillingPortalSession({
        stripeCustomerId: workspace.stripeCustomerId,
        returnUrl,
      });

      return session;
    } catch (error) {
      if (error instanceof AppRequestException) throw error;
      throw new AppRequestException({ ...ERROR_CODES.STRIPE_WEBHOOK_ERROR, errors: [error] });
    }
  }

  public async createCheckoutSession1({
    workspaceId,
    priceId,
    quantity = 1,
    successUrl,
    cancelUrl,
  }: {
    workspaceId: string;
    priceId: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    try {
      if (!workspaceId || !priceId || !successUrl || !cancelUrl)
        throw new AppRequestException(ERROR_CODES.INVALID_PARAMS);

      const workspace = await this.workspaceService.findById(workspaceId);
      if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

      let customerId = workspace.stripeCustomerId as string | undefined;

      if (!customerId) {
        // create a stripe customer placeholder using workspace name if available
        const customer = await this.stripeService.createCustomer(
          workspace.name || `workspace-${workspace._id}`,
          '',
        );
        customerId = customer.id;

        // persist stripeCustomerId in workspace
        await this.workspaceService.updateOne(
          { _id: new Types.ObjectId(workspace._id) },
          { stripeCustomerId: customerId },
        );
      }

      const session = await this.stripeService.createCheckoutSession({
        customerId,
        priceId,
        quantity,
        successUrl,
        cancelUrl,
      });

      return session;
    } catch (error) {
      if (error instanceof AppRequestException) throw error;
      throw new AppRequestException({ ...ERROR_CODES.STRIPE_WEBHOOK_ERROR, errors: [error] });
    }
  }

  async createCheckoutSession({
    customerId,
    priceId,
    quantity,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionDto) {
    const session = await this.stripeService.createCheckoutSession({
      customerId,
      priceId,
      quantity,
      successUrl,
      cancelUrl,
    });

    return session;
  }

  async listProducts() {
    const products = await this.stripeService.listProducts();
    return products;
  }

  async getProductById(id: string) {
    const product = await this.stripeService.getProductById(id);
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.stripeService.updateProduct(id, dto);
    await this.upsertProduct(product);
    return product;
  }

  async listPrices() {
    const prices = await this.stripeService.listPrices();
    return prices;
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.stripeService.createProduct(dto);
    await this.upsertProduct(product);
    return product;
  }

  async createPrice(dto: CreatePriceDto) {
    const price = await this.stripeService.createPrice(dto);
    await this.upsertPrice(price);
    return price;
  }

  async getPriceById(id: string) {
    const price = await this.stripeService.getPriceById(id);
    return price;
  }

  async updatePrice(id: string, dto: UpdatePriceDto) {
    const price = await this.stripeService.updatePrice(id, dto);
    await this.upsertPrice(price);
    return price;
  }
}
