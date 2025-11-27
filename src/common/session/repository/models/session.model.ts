import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { SessionCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';
import { SessionDoc, SessionEntity } from '@/common/session/repository/entities/session.entity';

@Injectable()
export class SessionModel extends DatabaseMongoObjectIdRepositoryAbstract<
  SessionEntity,
  SessionDoc
> {
  constructor(
    @DatabaseModel(SessionCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<SessionEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
