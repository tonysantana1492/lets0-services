import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import { AccountConfigCollectionName, AccountConfigSchema } from './entities/account-config.entity';
import { AccountConfigModel } from './models/account-config.model';

@Module({
  providers: [AccountConfigModel],
  exports: [AccountConfigModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: AccountConfigCollectionName,
          schema: AccountConfigSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class AccountConfigRepositoryModule {}
