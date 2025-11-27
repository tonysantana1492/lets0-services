import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Transactional } from '@nestjs-cls/transactional';

import { TwoFactorAuthCodeDto } from '@/common/auth-mfa/dto/mfa-code.dto';
import { MfaService } from '@/common/auth-mfa/mfa.service';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import { UserService } from '@/common/user/user.service';

import MongooseClassSerializerInterceptor from '../database/interceptor/mongoose-class-serializer.interceptor';
import { DocRequest } from '../doc/decorators/doc.decorator';
import {
  RequestInjectMetadataContext,
  RequestMetadata,
} from '../request/decorators/request.decorator';
import { IRequestMetadata } from '../request/interfaces/request-metadata.interface';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { UserEntity } from '../user/repository/entities/user.entity';
import { AuthService } from './auth.service';
import { Protected } from './decorators/protected.decorator';
import { Public } from './decorators/public.decorator';
import { LogInDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { IRequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
@ApiTags('auth')
@UseInterceptors(MongooseClassSerializerInterceptor(UserEntity))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @ResponseHttp()
  @Post('sign-up')
  @DocRequest({ body: RegisterDto })
  @RequestInjectMetadataContext()
  @Transactional()
  async register(@Body() registrationData: RegisterDto) {
    const accessTokenForNotVerifiedAccount = await this.authService.registerUser(registrationData);

    return {
      data: {
        token: accessTokenForNotVerifiedAccount,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: LogInDto })
  @Post('sign-in')
  @Transactional()
  async login(
    @Req() request: IRequestDefault,
    @Body() { email, password, fingerprint }: LogInDto,
    @RequestMetadata() requestMetadata: IRequestMetadata,
  ) {
    const user = await this.authService.getAuthenticatedUser({
      email,
      plainTextPassword: password,
      ip: requestMetadata.ip,
    });

    const isMfaEnabled = user.mfaConfig.isEnable;

    if (isMfaEnabled) {
      const { authTokenCookie } = this.mfaService.generateCookieWithMfaAuthToken({
        userId: user.id,
      });

      if (request.res) {
        request.res.setHeader('Set-Cookie', [authTokenCookie]);
      }

      return {
        data: {
          isMfaEnabled,
          accessToken: '',
          refreshToken: '',
          authTokenCookie,
        },
      };
    }

    const { accessTokenCookie, refreshTokenCookie, fingerprintCookie } =
      await this.authService.login({
        user,
        requestMetadata,
        fingerprint,
      });

    if (request.res) {
      request.res.setHeader('Set-Cookie', [
        accessTokenCookie,
        refreshTokenCookie,
        fingerprintCookie,
      ]);
    }

    return {
      data: {
        isMfaEnabled,
        accessTokenCookie,
        refreshTokenCookie,
      },
    };
  }

  @Protected()
  @ResponseHttp()
  @Post('sign-out')
  @Transactional()
  async signOut(@Req() request: IRequestWithUser) {
    const cookies = await this.authService.signOut({ sessionId: request.user.session.id });

    if (request.res) {
      request.res.setHeader('Set-Cookie', cookies);
    }
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: TwoFactorAuthCodeDto })
  @Post('otp-email-auth')
  @Transactional()
  async emailAuth(
    @Req() request: IRequestDefault,
    @RequestMetadata() requestMetadata: IRequestMetadata,
    @Body() { code, userId, fingerprint }: TwoFactorAuthCodeDto,
  ) {
    const user = await this.userService.getById(userId);

    const isCodeValid = this.mfaService.isMfaOtpEmailCodeValid(code, user);

    if (!isCodeValid) {
      throw new AppRequestException(ERROR_CODES.TWO_FACTOR_CODE_INVALID);
    }

    const { accessToken, refreshToken, accessTokenCookie, refreshTokenCookie, fingerprintCookie } =
      await this.authService.login({
        user,
        requestMetadata,
        fingerprint,
      });

    if (request.res) {
      request.res.setHeader('Set-Cookie', [
        accessTokenCookie,
        refreshTokenCookie,
        fingerprintCookie,
      ]);
    }

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Public()
  @ResponseHttp()
  @DocRequest({ body: TwoFactorAuthCodeDto })
  @Post('otp-google-authenticator-auth')
  @Transactional()
  async googleAuthenticatorAuth(
    @RequestMetadata() requestMetadata: IRequestMetadata,
    @Body() { code, userId, fingerprint }: TwoFactorAuthCodeDto,
  ) {
    const user = await this.userService.getById(userId);

    const isCodeValid = this.mfaService.isMfaGoogleAuthenticatorCodeValid(code, user);

    if (!isCodeValid) {
      throw new AppRequestException(ERROR_CODES.TWO_FACTOR_CODE_INVALID);
    }

    const { accessToken, refreshToken } = await this.authService.login({
      user,
      requestMetadata,
      fingerprint,
    });

    return {
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  // @Protected()
  // @UseGuards(RefreshAuthGuard)
  // @ResponseHttp()
  // @Post('refresh-token')
  // async refreshToken(
  //   @Req() request: IRequestWithUser,
  //   @RequestMetadata() requestMetadata: IRequestMetadata,
  // ) {
  //   const { refreshToken } = this.helperTokenService.extractTokenFromCookies(request);

  //   if (!refreshToken) throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_NOT_PROVIDED);

  //   const { payload } = this.helperTokenService.validateRefreshToken(refreshToken);

  //   const { accessTokenCookie, refreshTokenCookie } = await this.authService.refreshToken(
  //     payload.data,
  //     requestMetadata,
  //     payload.jti,
  //   );

  //   if (request.res) {
  //     request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
  //   }

  //   return {
  //     data: {
  //       accessTokenCookie,
  //       refreshTokenCookie,
  //     },
  //   };
  // }
}
