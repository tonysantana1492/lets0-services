import { Global, Module } from '@nestjs/common';

import { SessionRepositoryModule } from '@/common/session/repository/session.repository.module';
import { SessionService } from '@/common/session/session.service';

@Global()
@Module({
  imports: [SessionRepositoryModule],

  controllers: [],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
