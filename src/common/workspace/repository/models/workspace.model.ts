import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { WorkspaceCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';
import {
  WorkspaceDoc,
  WorkspaceEntity,
} from '@/common/workspace/repository/entities/workspace.entity';

@Injectable()
export class WorkspaceModel extends DatabaseMongoObjectIdRepositoryAbstract<
  WorkspaceEntity,
  WorkspaceDoc
> {
  constructor(
    @DatabaseModel(WorkspaceCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<WorkspaceEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
