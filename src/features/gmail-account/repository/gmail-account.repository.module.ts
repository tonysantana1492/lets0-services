import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import { GmailAccountCollectionName, GmailAccountSchema } from './entities/gmail-account.entity';
import { GmailThreadCollectionName, GmailThreadSchema } from './entities/gmail-thread.entity';
import { GmailAccountModel } from './models/gmail-account.model';
import { GmailThreadModel } from './models/gmail-thread.model';

@Module({
  providers: [GmailAccountModel, GmailThreadModel],
  exports: [GmailAccountModel, GmailThreadModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: GmailAccountCollectionName,
          schema: GmailAccountSchema,
        },
        {
          name: GmailThreadCollectionName,
          schema: GmailThreadSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class GmailAccountRepositoryModule {}
