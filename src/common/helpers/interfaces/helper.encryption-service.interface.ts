import type { ITokenPayload } from '@/common/auth/interfaces/token-payload.interface';

export interface IJwtResponse<T = ITokenPayload> {
  payload: IJwt<T>;
  isExpired: boolean | null;
  hasError: boolean;
}

export interface IJwt<T = ITokenPayload> {
  data: T;

  iat: number;

  nbf: number;

  exp: number;

  aud: string;

  iss: string;

  sub: string;

  jti: string;

  type: string;
}

export interface IHelperJwtVerifyOptions {
  audience?: string;
  issuer?: string;
  subject?: string;
  secretKey: string;
}

export interface IHelperJwtOptions extends IHelperJwtVerifyOptions {
  expiredIn: number | string;
  notBefore?: number | string;
}
