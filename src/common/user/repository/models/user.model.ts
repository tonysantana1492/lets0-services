import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model, Types } from 'mongoose';

import { IUserWithSession } from '@/common/auth/interfaces/user-with-session.interface';
import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import {
  SessionCollectionName,
  UserCollectionName,
} from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';
import { UserDoc, UserEntity } from '@/common/user/repository/entities/user.entity';

@Injectable()
export class UserModel extends DatabaseMongoObjectIdRepositoryAbstract<UserEntity, UserDoc> {
  constructor(
    @DatabaseModel(UserCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<UserEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }

  async getUserWithSession({
    userId,
    sessionId,
  }: {
    userId: string;
    sessionId: string;
  }): Promise<IUserWithSession> {
    const [user] = await this.pipeline([
      {
        $match: {
          _id: new Types.ObjectId(userId),
          isActive: true,
        },
      },
      {
        $addFields: {
          id: { $toString: '$_id' },
        },
      },
      {
        $lookup: {
          from: SessionCollectionName,
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$isActive', true] },
                    {
                      $eq: ['$_id', new Types.ObjectId(sessionId)],
                    },
                  ],
                },
              },
            },
            {
              $addFields: {
                id: { $toString: '$_id' },
              },
            },
          ],
          as: 'sessions',
        },
      },
      {
        $set: {
          session: { $arrayElemAt: ['$sessions', 0] },
        },
      },
      {
        $project: {
          sessions: 0,
        },
      },
    ]);

    return user as IUserWithSession;
  }
}
