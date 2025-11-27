import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import {
  NotificationMethodCollectionName,
  NotificationMethodSchema,
} from './entities/notification-method.entity';
import { NotificationMethodModel } from './models/notification-method.model';

@Module({
  providers: [NotificationMethodModel],
  exports: [NotificationMethodModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: NotificationMethodCollectionName,
          schema: NotificationMethodSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class NotificationMethodRepositoryModule {}
