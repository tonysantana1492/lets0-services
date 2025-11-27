import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import { NotificationCollectionName, NotificationSchema } from './entities/notification.entity';
import { NotificationModel } from './models/notification.model';

@Module({
  providers: [NotificationModel],
  exports: [NotificationModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: NotificationCollectionName,
          schema: NotificationSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class NotificationRepositoryModule {}
