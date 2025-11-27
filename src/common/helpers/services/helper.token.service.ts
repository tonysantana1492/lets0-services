import { Injectable } from '@nestjs/common';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IJwtConfigInterface } from '@/common/app-config/interfaces/jwt.config.interface';
import {
  IMfaOtpTokenPayload,
  ITokenPayload,
} from '@/common/auth/interfaces/token-payload.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { IJwtResponse } from '../interfaces/helper.encryption-service.interface';
import { HelperEncryptionService } from './helper.encryption.service';
import { HelperHashService } from './helper.hash.service';

@Injectable()
export class HelperTokenService {
  private jwtConfig: IJwtConfigInterface;

  constructor(
    private readonly helperEncryptionService: HelperEncryptionService,
    private readonly appConfigService: AppConfigService,
    private readonly helperHashService: HelperHashService,
  ) {
    this.jwtConfig = this.appConfigService.jwtConfig;
  }

  //! Access Token
  generateAccessToken(payload: ITokenPayload): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { type: this.jwtConfig.accessToken.key, data: payload },
      {
        secretKey: this.jwtConfig.accessToken.secretKey,
        expiredIn: this.jwtConfig.accessToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        subject: payload.userId,
      },
    );

    // return this.encryptToken(token);
    return token;
  }

  validateAccessToken(tokenEncrypted: string): IJwtResponse {
    // const token = this.decryptToken(tokenEncrypted);

    return this.helperEncryptionService.jwtVerify(tokenEncrypted, {
      secretKey: this.jwtConfig.accessToken.secretKey,
      audience: this.jwtConfig.audience,
      issuer: this.jwtConfig.issuer,
    });
  }

  //! Refresh Token
  generateRefreshToken(payload: ITokenPayload, jti: string): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { jti, type: this.jwtConfig.refreshToken.key, data: payload },
      {
        secretKey: this.jwtConfig.refreshToken.secretKey,
        expiredIn: this.jwtConfig.refreshToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        subject: payload.userId,
      },
    );

    // return this.encryptToken(token);
    return token;
  }

  validateRefreshToken(tokenEncrypted: string): IJwtResponse {
    // const token = this.decryptToken(tokenEncrypted);

    const jwtInfo = this.helperEncryptionService.jwtVerify(tokenEncrypted, {
      secretKey: this.jwtConfig.refreshToken.secretKey,
      audience: this.jwtConfig.audience,
      issuer: this.jwtConfig.issuer,
    });

    return jwtInfo;
  }

  //! Verification Token
  generateVerificationToken(payload: ITokenPayload): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { type: this.jwtConfig.verificationToken.key, data: payload },
      {
        secretKey: this.jwtConfig.verificationToken.secretKey,
        expiredIn: this.jwtConfig.verificationToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        subject: payload.userId,
      },
    );

    return this.encryptToken(token);
  }

  validateVerificationToken(tokenEncrypted: string): IJwtResponse {
    try {
      const token = this.decryptToken(tokenEncrypted);

      return this.helperEncryptionService.jwtVerify(token, {
        secretKey: this.jwtConfig.verificationToken.secretKey,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
      });
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.VERIFICATION_TOKEN_INVALID, errors: [error] });
    }
  }

  //! Forgot Password Token
  generateForgotPasswordToken(payload: ITokenPayload): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { type: this.jwtConfig.forgotPasswordToken.key, data: payload },
      {
        secretKey: this.jwtConfig.forgotPasswordToken.secretKey,
        expiredIn: this.jwtConfig.forgotPasswordToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        subject: payload.userId,
      },
    );

    return this.encryptToken(token);
  }

  validateForgotPasswordToken(tokenEncrypted: string): IJwtResponse {
    try {
      const token = this.decryptToken(tokenEncrypted);

      return this.helperEncryptionService.jwtVerify(token, {
        secretKey: this.jwtConfig.forgotPasswordToken.secretKey,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
      });
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.FORGOT_PASSWORD_TOKEN_INVALID,
        errors: [error],
      });
    }
  }

  //! Mfa Auth Token
  generateMfaAuthToken(payload: ITokenPayload): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { type: this.jwtConfig.mfaAuthToken.key, data: payload },
      {
        secretKey: this.jwtConfig.mfaAuthToken.secretKey,
        expiredIn: this.jwtConfig.mfaAuthToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.audience,
        subject: payload.userId,
      },
    );

    return this.encryptToken(token);
  }

  validateMfaAuthToken(tokenEncrypted: string): IJwtResponse {
    try {
      const token = this.decryptToken(tokenEncrypted);

      return this.helperEncryptionService.jwtVerify(token, {
        secretKey: this.jwtConfig.mfaAuthToken.secretKey,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
      });
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.MFA_AUTH_TOKEN_INVALID,
        errors: [error],
      });
    }
  }

  //! Mfa Otp Token
  generateMfaOtpToken(payload: IMfaOtpTokenPayload): string {
    const token = this.helperEncryptionService.jwtEncrypt(
      { type: this.jwtConfig.mfaOtpToken.key, data: payload },
      {
        secretKey: this.jwtConfig.mfaOtpToken.secretKey,
        expiredIn: this.jwtConfig.mfaOtpToken.expirationTime,
        notBefore: this.jwtConfig.notBeforeExpirationTime,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        subject: payload.userId,
      },
    );

    return token;
    // return this.encryptToken(token);
  }

  validateMfaOtpToken(tokenEncrypted: string): IJwtResponse<IMfaOtpTokenPayload> {
    try {
      // const token = this.decryptToken(tokenEncrypted);

      return this.helperEncryptionService.jwtVerify<IMfaOtpTokenPayload>(tokenEncrypted, {
        secretKey: this.jwtConfig.mfaOtpToken.secretKey,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
      });
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.MFA_OTP_TOKEN_INVALID,
        errors: [error],
      });
    }
  }

  public generateCookieWithMfaAuthToken(payload: ITokenPayload) {
    const authToken = this.generateMfaAuthToken(payload);
    const authTokenCookie = `${this.jwtConfig.mfaAuthToken.key}=${authToken}; HttpOnly; Secure; Path=/; Max-Age=${this.jwtConfig.mfaAuthToken.maxAge}`;
    return {
      authTokenCookie,
      authToken,
    };
  }

  public generateCookieWithFingerprint(fingerprint: string) {
    return `${this.jwtConfig.fingerprint.key}=${fingerprint}; HttpOnly; Secure; Path=/; Max-Age=${this.jwtConfig.maxAge}`;
  }

  public generateCookieWithJwtAccessToken(payload: ITokenPayload) {
    const accessToken = this.generateAccessToken(payload);
    const accessTokenCookie = `${this.jwtConfig.accessToken.key}=${accessToken}; HttpOnly; Secure; Path=/; Max-Age=${this.jwtConfig.maxAge}`;
    return {
      accessTokenCookie,
      accessToken,
    };
  }

  public generateCookieWithJwtRefreshToken(payload: ITokenPayload, jti: string) {
    const refreshToken = this.generateRefreshToken(payload, jti);
    const refreshTokenCookie = `${this.jwtConfig.refreshToken.key}=${refreshToken}; HttpOnly; Secure; Path=/; Max-Age=${this.jwtConfig.maxAge}`;
    return {
      refreshTokenCookie,
      refreshToken,
    };
  }

  public getCookiesForLogOut() {
    return [
      `${this.jwtConfig.accessToken.key}=; HttpOnly; Secure; Path=/; Max-Age=0`,
      `${this.jwtConfig.refreshToken.key}=; HttpOnly; Secure; Path=/; Max-Age=0`,
    ];
  }

  encryptToken(token: string, secret?: string): string {
    try {
      return this.helperEncryptionService.aes256Encrypt(
        token,
        secret ?? this.jwtConfig.encryptKey,
        this.jwtConfig.encryptIv,
      );
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.ACCESS_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  decryptToken(payload: string, secret?: string): string {
    try {
      return this.helperEncryptionService.aes256Decrypt(
        payload,
        secret ?? this.jwtConfig.encryptKey,
        this.jwtConfig.encryptIv,
      );
    } catch (error) {
      throw new AppRequestException({
        ...ERROR_CODES.ACCESS_TOKEN_INTERNAL_ERROR,
        errors: [error],
      });
    }
  }

  hash(payload: string): string {
    const salt = this.helperHashService.randomSalt(10);
    return this.helperHashService.bcrypt(payload, salt);
  }

  compare(payloadString: string, payloadHashed: string): boolean {
    return this.helperHashService.bcryptCompare(payloadString, payloadHashed);
  }

  public extractFingerprintFromCookies(request: IRequestDefault) {
    return request.cookies?.[this.jwtConfig.fingerprint.key];
  }

  public extractTokenFromCookies(request: IRequestDefault): {
    accessToken: string | undefined;
    refreshToken: string | undefined;
  } {
    return {
      accessToken: request.cookies?.[this.jwtConfig.accessToken.key],
      refreshToken: request.cookies?.[this.jwtConfig.refreshToken.key],
    };
  }

  public extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = (request.headers as any).authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
