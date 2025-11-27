import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { TwilioModule } from '../twilio/twilio.module';
import { UserModule } from '../user/user.module';
import { NotificationMethodController } from './controller/notification-method.controller';
import { NotificationMethodRepositoryModule } from './repository/notification-method.repository.module';
import { NotificationMethodService } from './services/notification-method.service';

@Module({
  controllers: [NotificationMethodController],
  imports: [NotificationMethodRepositoryModule, UserModule, TwilioModule, EmailModule],
  providers: [NotificationMethodService],
  exports: [NotificationMethodService],
})
export class NotificationMethodModule {}
