import { Module } from '@nestjs/common';

import { UserRepositoryModule } from '@/common/user/repository/user.repository.module';

import { MfaController } from './mfa.controller';
import { MfaService } from './mfa.service';

@Module({
  imports: [UserRepositoryModule],
  controllers: [MfaController],
  providers: [MfaService],
  exports: [MfaService],
})
export class MfaModule {}
