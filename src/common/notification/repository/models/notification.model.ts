import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import type { NotificationDoc, NotificationEntity } from '../entities/notification.entity';
import { NotificationCollectionName } from '../entities/notification.entity';

@Injectable()
export class NotificationModel extends DatabaseMongoObjectIdRepositoryAbstract<
  NotificationEntity,
  NotificationDoc
> {
  constructor(
    @DatabaseModel(NotificationCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<NotificationEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
