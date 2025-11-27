import { Injectable } from '@nestjs/common';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Model, PipelineStage, Types } from 'mongoose';

import { TransactionalAdapterMongoose } from '@/common/context/adapters/transactional-mongoose.adapter';
import { DatabaseMongoObjectIdRepositoryAbstract } from '@/common/database/abstracts/mongo/repositories/database.mongo.object-id.repository.abstract';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { DatabaseModel } from '@/common/database/decorators/database.decorator';

import {
  GmailThreadCollectionName,
  GmailThreadDoc,
  GmailThreadEntity,
} from '../entities/gmail-thread.entity';

@Injectable()
export class GmailThreadModel extends DatabaseMongoObjectIdRepositoryAbstract<
  GmailThreadEntity,
  GmailThreadDoc
> {
  constructor(
    @DatabaseModel(GmailThreadCollectionName, MAIN_DB_CONNECTION_NAME)
    modelDoc: Model<GmailThreadEntity>,
    txHost: TransactionHost<TransactionalAdapterMongoose>,
  ) {
    super(modelDoc, undefined, txHost);
  }

  async facetSearchPipeline(search: PipelineStage[]): Promise<any> {
    try {
      const [results]: Array<{ results: any[]; total: number }> = await this.pipeline(search);

      return {
        results: results?.results ?? [],
        total: results?.total ?? 0,
      };
    } catch {
      return {
        results: [],
        total: 0,
      };
    }
  }

  async findThreadsByAccountAndPage<T>({
    accountId,
    limit,
    offset,
  }: {
    accountId: string;
    limit: number;
    offset: number;
  }): Promise<{ results: T[]; total: number }> {
    return await this.facetSearchPipeline([
      {
        $match: {
          accountId: new Types.ObjectId(accountId),
        },
      },
      {
        $group: {
          _id: '$threadId',
          emails: {
            $push: {
              id: '$_id',
              emailId: '$emailId',
              subject: '$subject',
              from: '$from',
              to: '$to',
              cc: '$cc',
              bcc: '$bcc',
              date: '$date',
              snippet: '$snippet',
              attachments: '$attachments',
              labelIds: '$labelIds',
            },
          },
        },
      },
      {
        $unwind: '$emails',
      },
      {
        $sort: {
          'emails.date': -1,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$emails.id',
          threadId: '$_id',
          emailId: '$emails.emailId',
          subject: '$emails.subject',
          from: '$emails.from',
          to: '$emails.to',
          cc: '$emails.cc',
          bcc: '$emails.bcc',
          date: '$emails.date',
          snippet: '$emails.snippet',
          attachments: '$emails.attachments',
          labelIds: '$emails.labelIds',
        },
      },
      {
        $facet: {
          results: [{ $skip: offset }, { $limit: limit }],
          total: [{ $count: 'totalCount' }],
        },
      },
      {
        $project: {
          results: 1,
          total: { $arrayElemAt: ['$total.totalCount', 0] },
        },
      },
    ] as PipelineStage[]);
  }

  async getEmailSuggestions(accountId: string): Promise<string[]> {
    const result = await this.pipeline<{ suggestions: string[] }>([
      {
        $match: {
          accountId: new Types.ObjectId(accountId),
        },
      },
      {
        $group: {
          _id: '$from',
        },
      },
      {
        $project: {
          _id: 0,
          from: '$_id',
        },
      },
      {
        $group: {
          _id: null,
          suggestions: { $push: '$from' },
        },
      },
      {
        $project: {
          _id: 0,
          suggestions: 1,
        },
      },
    ]);

    return result[0]?.suggestions ?? [];
  }
}
