import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import { PriceCollectionName, PriceDoc, PriceEntity } from '../entity/price.entity';

@Injectable()
export class PriceModel extends DatabaseMongoObjectIdRepositoryAbstract<PriceEntity, PriceDoc> {
  constructor(
    @DatabaseModel(PriceCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<PriceEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
