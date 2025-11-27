import type { IJwtConfigInterface } from '@/common/app-config/interfaces/jwt.config.interface';
import { registerAs } from '@nestjs/config';

import { seconds } from '@/common/helpers/constants/helper.function.constant';

export default registerAs(
  'jwt',
  (): IJwtConfigInterface => ({
    accessToken: {
      key: 'access-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_ACCESS_TOKEN_EXPIRED ?? '900000'), // 15 min in ms
    },

    refreshToken: {
      key: 'refresh-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_REFRESH_TOKEN_EXPIRED ?? '1296000000'), // 15 days in ms
    },

    verificationToken: {
      key: 'verification-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_VERIFICATION_TOKEN_EXPIRED ?? '86400000'), // 1 day in ms
    },

    forgotPasswordToken: {
      key: 'forgot-password-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_FORGOT_PASSWORD_TOKEN_EXPIRED ?? '86400000'), // 1 day in ms
    },

    mfaAuthToken: {
      key: 'mfa-auth-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_MFA_AUTH_TOKEN_EXPIRED ?? '900000'), // 15 min in ms
      maxAge: seconds('900000'), // 15 min in ms
    },

    mfaOtpToken: {
      key: 'mfa-otp-token',
      secretKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY ?? '123456',
      expirationTime: seconds(process.env.JWT_MFA_OTP_TOKEN_EXPIRED ?? '180000'), // 3 min in ms
    },

    fingerprint: {
      key: 'fingerprint',
    },

    // Cookies Options
    maxAge: seconds('31536000000'), // 365 days in ms

    // Encrypt options
    encryptKey: process.env.JWT_ENCRYPT_KEY ?? '',
    encryptIv: process.env.JWT_ENCRYPT_IV ?? '',
    payloadEncryption: process.env.JWT_PAYLOAD_ENCRYPT === 'true',

    // Token options
    notBeforeExpirationTime: seconds(process.env.JWT_NOT_BEFORE_EXPIRATION ?? '0'), // immediately
    subject: process.env.JWT_SUBJECT ?? 'lets0Services',
    audience: process.env.JWT_AUDIENCE ?? 'https://lets0.com',
    issuer: process.env.JWT_ISSUER ?? 'lets0',
    prefixAuthorization: 'Bearer',
  }),
);
