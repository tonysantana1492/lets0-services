import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import { PriceCollectionName, PriceSchema } from './entity/price.entity';
import { ProductCollectionName, ProductSchema } from './entity/product.entity';
import { SubscriptionCollectionName, SubscriptionSchema } from './entity/subscription.entity';
import { PriceModel } from './models/price.model';
import { ProductModel } from './models/product.model';
import { SubscriptionModel } from './models/subscription.model';

@Module({
  providers: [PriceModel, ProductModel, SubscriptionModel],
  exports: [PriceModel, ProductModel, SubscriptionModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: PriceCollectionName,
          schema: PriceSchema,
        },
        {
          name: ProductCollectionName,
          schema: ProductSchema,
        },
        {
          name: SubscriptionCollectionName,
          schema: SubscriptionSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class BillingRepositoryModule {}
