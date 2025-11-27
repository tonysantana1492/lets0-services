import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { LogDoc, LogEntity } from '@/common/app-logger/repository/entities/log.entity';
import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { LogCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

@Injectable()
export class LogModel extends DatabaseMongoObjectIdRepositoryAbstract<LogEntity, LogDoc> {
  constructor(
    @DatabaseModel(LogCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<LogEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
