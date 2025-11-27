import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { HelperArrayService } from './services/helper.array.service';
import { HelperDateService } from './services/helper.date.service';
import { HelperEncryptionService } from './services/helper.encryption.service';
import { HelperHashService } from './services/helper.hash.service';
import { HelperNumberService } from './services/helper.number.service';
import { HelperTokenService } from './services/helper.token.service';

@Global()
@Module({
  imports: [PassportModule],
  providers: [
    HelperArrayService,
    HelperDateService,
    HelperHashService,
    HelperEncryptionService,
    HelperTokenService,
    HelperNumberService,
  ],
  exports: [
    HelperArrayService,
    HelperDateService,
    HelperHashService,
    HelperEncryptionService,
    HelperTokenService,
    HelperNumberService,
  ],
  controllers: [],
})
export class HelperModule {}
