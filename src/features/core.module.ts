import type { Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { ProfileModule } from '@/features/profile/profile.module';

import { GmailAccountModule } from './gmail-account/gmail-account.module';

const providers: Provider[] = [];

const imports = [GmailAccountModule, ProfileModule];

const controllers = [];

@Module({
  imports,
  providers,
  controllers,
})
export class CoreModule {}
