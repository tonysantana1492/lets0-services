import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import {
  GmailAccountCollectionName,
  GmailAccountDoc,
  GmailAccountEntity,
} from '../entities/gmail-account.entity';

@Injectable()
export class GmailAccountModel extends DatabaseMongoObjectIdRepositoryAbstract<
  GmailAccountEntity,
  GmailAccountDoc
> {
  constructor(
    @DatabaseModel(GmailAccountCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<GmailAccountEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
