import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { emailModuleAsyncOptionsLocal } from '@/common/app-config/constants/email.config';

import { MailerModule } from '../mailer/mailer.module';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule, MailerModule.forRootAsync(emailModuleAsyncOptionsLocal)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
