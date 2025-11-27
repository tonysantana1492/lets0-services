export interface IJwtConfigToken {
  key: string;
  secretKey: string;
  expirationTime: number;
  maxAge?: number;
}

export interface IJwtConfigInterface {
  verificationToken: IJwtConfigToken;

  forgotPasswordToken: IJwtConfigToken;

  accessToken: IJwtConfigToken;

  refreshToken: IJwtConfigToken;

  mfaAuthToken: IJwtConfigToken;

  mfaOtpToken: IJwtConfigToken;

  fingerprint: { key: string };

  notBeforeExpirationTime: number;
  encryptKey: string;
  encryptIv: string;
  maxAge: number;
  subject: string;
  audience: string;
  issuer: string;
  prefixAuthorization: string;
  payloadEncryption: boolean;
}
