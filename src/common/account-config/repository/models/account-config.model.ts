import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import {
  AccountConfigCollectionName,
  AccountConfigDoc,
  AccountConfigEntity,
} from '../entities/account-config.entity';

@Injectable()
export class AccountConfigModel extends DatabaseMongoObjectIdRepositoryAbstract<
  AccountConfigEntity,
  AccountConfigDoc
> {
  constructor(
    @DatabaseModel(AccountConfigCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<AccountConfigEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
