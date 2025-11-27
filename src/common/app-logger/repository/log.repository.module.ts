import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogSchema } from '@/common/app-logger/repository/entities/log.entity';
import { LogModel } from '@/common/app-logger/repository/models/log.model';
import { LogCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

@Module({
  providers: [LogModel],
  exports: [LogModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: LogCollectionName,
          schema: LogSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class LogRepositoryModule {}
