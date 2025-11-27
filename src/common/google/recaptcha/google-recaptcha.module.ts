import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GoogleRecaptchaController } from './google-recaptcha.controller';
import { GoogleRecaptchaService } from './google-recaptcha.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleRecaptchaService],
  controllers: [GoogleRecaptchaController],
})
export class GoogleRecaptchaModule {}
