import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import type {
  NotificationMethodDoc,
  NotificationMethodEntity,
} from '../entities/notification-method.entity';
import { NotificationMethodCollectionName } from '../entities/notification-method.entity';

@Injectable()
export class NotificationMethodModel extends DatabaseMongoObjectIdRepositoryAbstract<
  NotificationMethodEntity,
  NotificationMethodDoc
> {
  constructor(
    @DatabaseModel(NotificationMethodCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<NotificationMethodEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
