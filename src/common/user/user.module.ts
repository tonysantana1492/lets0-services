import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

import { IpAddressService } from '@/common/user/ip-address.service';

import { EmailModule } from '../email/email.module';
import { UserRepositoryModule } from './repository/user.repository.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [UserRepositoryModule, EmailModule, HttpModule],

  controllers: [UserController],
  providers: [UserService, IpAddressService],
  exports: [UserService, IpAddressService],
})
export class UserModule {}
