import {
  Body,
  Controller,
  Delete,
  Get,
  // eslint-disable-next-line no-redeclare
  Headers,
  Param,
  Post,
  Put,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Types } from 'mongoose';

import { Protected } from '@/common/auth/decorators/protected.decorator';
import { Public } from '@/common/auth/decorators/public.decorator';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { ResponseHttp } from '@/common/response/decorators/response.decorator';
import { CreateCheckoutSessionDto } from '@/common/stripe/dtos/create-checkout-session.dto';
import { CreatePortalSessionDto } from '@/common/stripe/dtos/create-portal-session.dto';
import { CreatePriceDto } from '@/common/stripe/dtos/create-price.dto';
import { CreateProductDto } from '@/common/stripe/dtos/create-product.dto';
import { UpdatePriceDto } from '@/common/stripe/dtos/update-price.dto';
import { UpdateProductDto } from '@/common/stripe/dtos/update-product.dto';
import { BillingService } from '@/common/stripe/services/billing.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Public()
  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    if (!sig) throw new AppRequestException(ERROR_CODES.STRIPE_WEBHOOK_SECRET_NOT_FOUND);

    await this.billingService.handleWebhook(sig, req.rawBody);

    return { received: true };
  }

  @Public()
  @ResponseHttp()
  @Get('products')
  async getProducts() {
    const products = await this.billingService.getProducts();
    return { data: { products } };
  }

  @Public()
  @ResponseHttp()
  @Get('subscriptions')
  async getSubscriptions() {
    const subscriptions = await this.billingService.getSubscriptions();
    return { data: { subscriptions } };
  }

  @Public()
  @ResponseHttp()
  @Get('plans')
  async getPlans() {
    const plans = await this.billingService.getPlans();
    return { data: { plans } };
  }

  @Protected()
  @ResponseHttp()
  @Get('status')
  async getStatus(@Req() { user }: IRequestWithUser) {
    const { workspaceId } = user;
    const status = await this.billingService.getStatus({
      workspaceId: (workspaceId as Types.ObjectId).toHexString(),
    });
    return { data: { status } };
  }

  @Protected()
  @ResponseHttp()
  @DocRequest({ body: CreatePortalSessionDto })
  @Post('portal')
  async createPortalSession(
    @Req() { user }: IRequestWithUser,
    @Body() dto: CreatePortalSessionDto,
  ) {
    const portal = await this.billingService.createPortalSession({
      workspaceId: (user.workspaceId as Types.ObjectId).toHexString(),
      returnUrl: dto.returnUrl,
    });
    return { data: { portal } };
  }

  @Public()
  @ResponseHttp()
  @Post('checkout')
  @DocRequest({ body: CreateCheckoutSessionDto })
  async createCheckout(
    @Body()
    dto: CreateCheckoutSessionDto,
  ) {
    const session = await this.billingService.createCheckoutSession(dto);
    return { data: { session } };
  }

  //////
  // Products
  @Public()
  @ResponseHttp()
  @DocRequest({ body: CreateProductDto })
  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.billingService.createProduct(dto);
  }

  @Public()
  @ResponseHttp()
  @Get('products')
  async listProducts() {
    const products = await this.billingService.listProducts();
    return { data: { products } };
  }

  @Public()
  @ResponseHttp()
  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.billingService.getProductById(id);
    return { data: { product } };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: UpdateProductDto })
  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.billingService.updateProduct(id, dto);
    return { data: { product } };
  }

  @Public()
  @ResponseHttp()
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.billingService.deleteProduct(id);
  }

  // Prices
  @Public()
  @ResponseHttp()
  @DocRequest({ body: CreatePriceDto })
  @Post('prices')
  async createPrice(@Body() dto: CreatePriceDto) {
    const price = await this.billingService.createPrice(dto);
    return { data: { price } };
  }

  @Public()
  @ResponseHttp()
  @Get('prices')
  async listPrices() {
    const prices = await this.billingService.listPrices();
    return { data: { prices } };
  }

  @Public()
  @ResponseHttp()
  @Get('prices/:id')
  async getPrice(@Param('id') id: string) {
    const price = await this.billingService.getPriceById(id);
    return { data: { price } };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: UpdatePriceDto })
  @Put('prices/:id')
  async updatePrice(@Param('id') id: string, @Body() dto: UpdatePriceDto) {
    const price = await this.billingService.updatePrice(id, dto);
    return { data: { price } };
  }

  @Public()
  @ResponseHttp()
  @Delete('prices/:id')
  async deletePrice(@Param('id') id: string) {
    await this.billingService.deletePrice(id);
    return { data: { id } };
  }
}
