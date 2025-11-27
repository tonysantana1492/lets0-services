import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthTokenParamDto } from '@/common/auth-mfa/dto/mfa-auth-token.dto';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { RequestInjectMetadataContext } from '@/common/request/decorators/request.decorator';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { Protected } from '../auth/decorators/protected.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IRequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ERROR_CODES } from '../error/constants/error-code';
import { AppRequestException } from '../error/exceptions/app-request.exception';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { TwoFactorEnableDto } from './dto/mfa-enable.dto';
import { MfaService } from './mfa.service';

@Controller('auth-mfa')
@ApiTags('auth-mfa')
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Protected()
  @ResponseHttp()
  @Get('google-authenticator-secret')
  async getMfaGoogleAuthenticatorSecret(@Req() request: IRequestWithUser) {
    const { otpAuthUrl, secret } = await this.mfaService.getMfaGoogleAuthenticatorSecret(
      request.user,
    );

    const qrCodeUrl = await this.mfaService.pipeQrCode(otpAuthUrl);

    return {
      data: {
        secret,
        qrCodeUrl,
      },
    };
  }

  @Protected()
  @ResponseHttp()
  @DocRequest({ body: TwoFactorEnableDto })
  @Post('turn-on')
  async turnOnMfa(@Req() request: IRequestWithUser, @Body() { code }: TwoFactorEnableDto) {
    const isCodeValid = this.mfaService.isMfaGoogleAuthenticatorCodeValid(code, request.user);

    if (!isCodeValid) {
      throw new AppRequestException(ERROR_CODES.TWO_FACTOR_CODE_INVALID);
    }

    await this.mfaService.turnOnMfa(request.user.id);
  }

  @Protected()
  @ResponseHttp()
  @DocRequest({ body: TwoFactorEnableDto })
  @Post('turn-off')
  async turnOffMfa(@Req() request: IRequestWithUser, @Body() { code }: TwoFactorEnableDto) {
    const isCodeValid = this.mfaService.isMfaGoogleAuthenticatorCodeValid(code, request.user);

    if (!isCodeValid) {
      throw new AppRequestException(ERROR_CODES.TWO_FACTOR_CODE_INVALID);
    }

    await this.mfaService.turnOffMfa(request.user.id);
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AuthTokenParamDto })
  @Post('validate-auth-token')
  async validateMfaAuthToken(@Body() { authToken }: AuthTokenParamDto) {
    const { userId } = this.mfaService.validateMfaAuthToken({ authToken });

    return {
      data: {
        userId,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AuthTokenParamDto })
  @RequestInjectMetadataContext()
  @Post('generate-otp-email-token')
  async generateMfaOtpTokenEmail(
    @Req() request: IRequestDefault,
    @Body() { authToken }: AuthTokenParamDto,
  ) {
    const { userId } = this.mfaService.validateMfaAuthToken({ authToken });

    const { otpCodeTokenEncrypted, type, isCodePresent } =
      await this.mfaService.generateMfaOtpTokenEmail({ userId });

    const { authTokenCookie } = this.mfaService.generateCookieWithMfaAuthToken({ userId });

    if (request.res) {
      request.res.setHeader('Set-Cookie', [authTokenCookie]);
    }

    return {
      data: {
        otpCodeTokenEncrypted,
        type,
        isCodePresent,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: AuthTokenParamDto })
  @Post('validate-otp-email-token')
  async validateOtpTokenEmail(@Body() { authToken }: AuthTokenParamDto) {
    const { timeRemaining, userId, type } = await this.mfaService.validateOtpTokenEmail({
      authToken,
    });

    return {
      data: {
        timeRemaining,
        userId,
        type,
      },
    };
  }
}
