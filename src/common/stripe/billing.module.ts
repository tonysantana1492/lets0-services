import { Module } from '@nestjs/common';

import { BillingService } from '@/common/stripe/services/billing.service';

import { UserRepositoryModule } from '../user/repository/user.repository.module';
import { WorkspaceRepositoryModule } from '../workspace/repository/workspace.repository.module';
import { BillingController } from './controller/billing.controller';
import { BillingRepositoryModule } from './repository/billing.repository.module';
import { StripeService } from './services/stripe.service';

@Module({
  controllers: [BillingController],
  imports: [BillingRepositoryModule, UserRepositoryModule, WorkspaceRepositoryModule],
  providers: [BillingService, StripeService],
  exports: [BillingService],
})
export class BillingModule {}
