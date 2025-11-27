// import type { ENUM_API_KEY_TYPE } from '@/common/app-config/enums/api-key.enum';

// export interface IJwt {
//   [key: string]: any;
//   iss?: string | undefined;
//   sub?: string | undefined;
//   aud?: string | string[] | undefined;
//   exp?: number | undefined;
//   nbf?: number | undefined;
//   iat?: number | undefined;
//   jti?: string | undefined;
// }

// export interface IEncryptedToken extends IJwt {
//   hash: string;
// }

// export interface ILegacyToken {
//   t: string;
// }

// export type ApiKeyTransform = IEncryptedToken | ILegacyToken;

// export interface IApiKeyPayload {
//   token: string;

//   exp: number;

//   type?: ENUM_API_KEY_TYPE;

//   name?: string;
// }
