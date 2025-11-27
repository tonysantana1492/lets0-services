import { Module } from '@nestjs/common';

import { AccountConfigController } from './account-config.controller';
import { AccountConfigService } from './account-config.service';
import { AccountConfigRepositoryModule } from './repository/account-config.repository.module';

@Module({
  imports: [AccountConfigRepositoryModule],
  controllers: [AccountConfigController],
  providers: [AccountConfigService],
  exports: [AccountConfigService],
})
export class AccountConfigModule {}
