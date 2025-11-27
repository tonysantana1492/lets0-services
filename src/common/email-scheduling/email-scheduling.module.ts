import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { EmailSchedulingController } from './email-scheduling.controller';
import { EmailSchedulingService } from './email-scheduling.service';

@Module({
  imports: [EmailModule],
  providers: [EmailSchedulingService],
  controllers: [EmailSchedulingController],
})
export class EmailSchedulingModule {}
