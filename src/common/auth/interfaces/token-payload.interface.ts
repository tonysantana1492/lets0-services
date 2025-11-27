export interface ITokenPayload {
  email: string;
  userId: string;
  sessionId: string;
}

export enum IMfaOtpTokenType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface IMfaOtpTokenPayload {
  userId: string;
  type: IMfaOtpTokenType;
  code: string;
}
