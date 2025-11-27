import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { ProfileCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';
import { ProfileDoc, ProfileEntity } from '@/features/profile/repository/entities/profile.entity';

@Injectable()
export class ProfileModel extends DatabaseMongoObjectIdRepositoryAbstract<
  ProfileEntity,
  ProfileDoc
> {
  constructor(
    @DatabaseModel(ProfileCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<ProfileEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }
}
