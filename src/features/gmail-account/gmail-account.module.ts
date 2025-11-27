import { Module } from '@nestjs/common';

import { UserModule } from '@/common/user/user.module';

import { GmailAccountController } from './gmail-account.controller';
import { GmailAccountService } from './gmail-account.service';
import { GmailService } from './gmail.service';
import { GmailAccountRepositoryModule } from './repository/gmail-account.repository.module';

@Module({
  imports: [GmailAccountRepositoryModule, UserModule],
  controllers: [GmailAccountController],
  providers: [GmailAccountService, GmailService],
})
export class GmailAccountModule {}
