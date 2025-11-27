import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import { ProductCollectionName, ProductDoc, ProductEntity } from '../entity/product.entity';

@Injectable()
export class ProductModel extends DatabaseMongoObjectIdRepositoryAbstract<
  ProductEntity,
  ProductDoc
> {
  constructor(
    @DatabaseModel(ProductCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<ProductEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
