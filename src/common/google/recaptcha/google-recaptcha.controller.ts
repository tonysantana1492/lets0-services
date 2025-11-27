import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '@/common/auth/decorators/public.decorator';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { ResponseHttp } from '@/common/response/decorators/response.decorator';

import { VerifyRecaptchaDto } from './dtos/verify-recaptcha.dto';
import { GoogleRecaptchaService } from './google-recaptcha.service';

@Controller('recaptcha')
@ApiTags('recaptcha')
export class GoogleRecaptchaController {
  constructor(private readonly recaptchaService: GoogleRecaptchaService) {}

  @Public()
  @ResponseHttp()
  @DocRequest({ body: VerifyRecaptchaDto })
  @Post('verify')
  async verify(@Body() body: VerifyRecaptchaDto) {
    const { recaptchaValue } = body;

    const isVerified = await this.recaptchaService.verifyRecaptcha(recaptchaValue);

    if (!isVerified) throw new AppRequestException(ERROR_CODES.RECAPTCHA_INVALID);

    return { data: { success: true } };
  }
}
