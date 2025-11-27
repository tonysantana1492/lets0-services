import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { SessionSchema } from '@/common/session/repository/entities/session.entity';
import { SessionModel } from '@/common/session/repository/models/session.model';

@Module({
  providers: [SessionModel],
  exports: [SessionModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: SessionCollectionName,
          schema: SessionSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class SessionRepositoryModule {}
