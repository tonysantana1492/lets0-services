import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { AuthTokenParamDto } from '@/common/auth-mfa/dto/mfa-auth-token.dto';
import { IMfaOtpTokenType } from '@/common/auth/interfaces/token-payload.interface';
import { IUserWithSession } from '@/common/auth/interfaces/user-with-session.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { HelperTokenService } from '@/common/helpers/services/helper.token.service';
import { IResponseDefault } from '@/common/response/interfaces/response.interface';
import { UserDoc, UserEntity } from '@/common/user/repository/entities/user.entity';
import { UserModel } from '@/common/user/repository/models/user.model';
import { UserService } from '@/common/user/user.service';

@Injectable()
export class MfaService {
  constructor(
    private readonly userService: UserService,
    private readonly appConfigService: AppConfigService,
    private readonly helperTokenService: HelperTokenService,
    private readonly userModel: UserModel,
  ) {}

  public async generateMfaGoogleAuthenticatorSecret(user: IUserWithSession) {
    if (user.mfaConfig.googleAuthSecretEncrypted) return user.mfaConfig.googleAuthSecretEncrypted;

    // This is the secret generate that is use for add the app to google authenticator
    // example KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD
    const secret = authenticator.generateSecret();

    const googleAuthSecretEncrypted = this.helperTokenService.encryptToken(secret);

    await this.setMfaGoogleAuthenticatorSecret({
      googleAuthSecretEncrypted,
      userId: user.id,
    });

    return secret;
  }

  public async getMfaGoogleAuthenticatorSecret(user: IUserWithSession) {
    const { twoFactorName } = this.appConfigService.appConfig;
    let secret = '';

    if (user.mfaConfig.googleAuthSecretEncrypted) {
      secret = this.helperTokenService.decryptToken(user.mfaConfig.googleAuthSecretEncrypted);
    } else {
      secret = await this.generateMfaGoogleAuthenticatorSecret(user);
    }

    const otpAuthUrl = authenticator.keyuri(user.email, twoFactorName, secret);

    return {
      secret,
      otpAuthUrl,
    };
  }

  public isMfaGoogleAuthenticatorCodeValid(twoFactorAuthenticationCode: string, user: UserEntity) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user?.mfaConfig.googleAuthSecretEncrypted ?? '',
    });
  }

  public isMfaOtpEmailCodeValid(twoFactorAuthenticationCode: string, user: UserEntity) {
    if (!user.mfaConfig.otpCodeTokenEncrypted) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_NOT_PROVIDED);
    }

    const { isExpired, payload } = this.helperTokenService.validateMfaOtpToken(
      user.mfaConfig.otpCodeTokenEncrypted,
    );

    if (isExpired) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_EXPIRED);
    }

    if (payload.data.type !== IMfaOtpTokenType.EMAIL) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_INCORRECT_TYPE);
    }

    return payload.data.code === twoFactorAuthenticationCode;
  }

  public createMfaAuthToken(user: UserDoc): { authToken: string; authTokenCookie: string } {
    const { authToken, authTokenCookie } = this.helperTokenService.generateCookieWithMfaAuthToken({
      userId: user.id,
      email: user.email,
      sessionId: '',
    });

    return { authToken, authTokenCookie };
  }

  public generateCookieWithMfaAuthToken({ userId }: { userId: string }) {
    return this.helperTokenService.generateCookieWithMfaAuthToken({
      email: '',
      sessionId: '',
      userId,
    });
  }

  public validateMfaAuthToken({ authToken }: AuthTokenParamDto): { userId: string } {
    const { payload } = this.helperTokenService.validateMfaAuthToken(authToken);

    return { userId: payload.data.userId };
  }

  public async pipeQrCode(otpAuthUrl: string): Promise<string> {
    return new Promise((resolve) => {
      toDataURL(otpAuthUrl, (error, qrCodeUrl) => {
        if (error) {
          throw new AppRequestException({
            ...ERROR_CODES.QR_CODE_GENERATION_FAILED,
            errors: [error],
          });
        } else {
          resolve(qrCodeUrl);
        }
      });
    });
  }

  public async pipeQrCodeStream(stream: IResponseDefault, otpAuthUrl: string) {
    return toFileStream(stream, otpAuthUrl);
  }

  public async generateMfaOtpTokenEmail({ userId }: { userId: string }) {
    const user = await this.userService.getById(userId);

    if (user.mfaConfig.otpCodeTokenEncrypted) {
      const { payload, isExpired } = this.helperTokenService.validateMfaOtpToken(
        user.mfaConfig.otpCodeTokenEncrypted,
      );

      if (!isExpired) {
        return {
          otpCodeTokenEncrypted: user.mfaConfig.otpCodeTokenEncrypted,
          type: payload.data.type,
          isCodePresent: true,
        };
      }
    }

    // In this case is not necessary the real secret, just I need a 6 digit random number
    const code = authenticator.generate('');

    const otpCodeTokenEncrypted = this.helperTokenService.generateMfaOtpToken({
      userId,
      type: IMfaOtpTokenType.EMAIL,
      code,
    });

    // update encrypted otp token
    user.mfaConfig.otpCodeTokenEncrypted = otpCodeTokenEncrypted;

    await Promise.all([user.save(), this.userService.sendOtpCodeEmail({ code, user })]);

    return { otpCodeTokenEncrypted, type: IMfaOtpTokenType.EMAIL, isCodePresent: false };
  }

  public async validateOtpTokenEmail({ authToken }: AuthTokenParamDto): Promise<{
    timeRemaining: number;
    userId: string;
    type: IMfaOtpTokenType;
  }> {
    const { payload, isExpired } = this.helperTokenService.validateMfaAuthToken(authToken);

    if (isExpired) {
      throw new AppRequestException(ERROR_CODES.MFA_AUTH_TOKEN_EXPIRED);
    }

    const { mfaConfig } = await this.userService.getById(payload.data.userId);

    if (!mfaConfig.otpCodeTokenEncrypted) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_NOT_PROVIDED);
    }

    const { payload: mfaOtpTokenPayload, isExpired: isMfaOtpTokenExpired } =
      this.helperTokenService.validateMfaOtpToken(mfaConfig.otpCodeTokenEncrypted);

    if (isMfaOtpTokenExpired) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_EXPIRED);
    }

    const { exp, data } = mfaOtpTokenPayload;

    if (data.type !== IMfaOtpTokenType.EMAIL) {
      throw new AppRequestException(ERROR_CODES.MFA_OTP_TOKEN_INCORRECT_TYPE);
    }

    const now = Math.floor(Date.now() / 1000);

    const timeRemaining = exp - now;

    return { timeRemaining, userId: data.userId, type: data.type };
  }

  //! MFA
  async setMfaGoogleAuthenticatorSecret({
    googleAuthSecretEncrypted,
    userId,
  }: {
    googleAuthSecretEncrypted: string;
    userId: string;
  }) {
    return await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(userId),
        // mfaConfig: { isEnable: true }
      },
      {
        mfaConfig: { googleAuthSecretEncrypted },
      },
    );
  }

  async turnOnMfa(userId: string) {
    return await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        mfaConfig: { isEnable: true },
      },
    );
  }

  async turnOffMfa(userId: string) {
    return await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        mfaConfig: { isEnable: false },
      },
    );
  }

  public async updateMfaOtpToken({
    userId,
    otpCodeTokenEncrypted,
  }: {
    userId: string;
    otpCodeTokenEncrypted: string;
  }) {
    await this.userModel.updateOne(
      {
        _id: new Types.ObjectId(userId),
      },
      {
        mfaConfig: { otpCodeTokenEncrypted },
      },
    );
  }
}
