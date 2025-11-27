import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { MfaModule } from '@/common/auth-mfa/mfa.module';
import { SessionModule } from '@/common/session/session.module';

import { UserModule } from '../user/user.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule, UserModule, WorkspaceModule, SessionModule, MfaModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
