import { Module } from '@nestjs/common';

import { NotificationMethodModule } from '../notification-method/notification-method.module';
import { UserModule } from '../user/user.module';
import { NotificationController } from './controller/notification.controller';
import { NotificationRepositoryModule } from './repository/notification.module';
import { NotificationService } from './services/notification.service';

@Module({
  controllers: [NotificationController],
  imports: [NotificationRepositoryModule, UserModule, NotificationMethodModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
