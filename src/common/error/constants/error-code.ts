import type { I18nPath } from '@/languages/generated/i18n.generated';
import { HttpStatus } from '@nestjs/common';

// ! IMPORTANT  EVERY ERROR WITH HttpStatus.SERVICE_UNAVAILABLE (401) send a logout response to the backend
interface IErrorCodeItem {
  responseCode: string;
  message: I18nPath;
  statusCode: HttpStatus;
}

export const ERROR_CODES = {
  // COMMON
  INVALID_PARAMS: {
    responseCode: 'CO0000',
    message: 'request.error.invalidParameters',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  ENV_CONFIG_MISSING: {
    responseCode: 'CO0001',
    message: 'app.error.envConfigMissing',
    statusCode: HttpStatus.PRECONDITION_FAILED,
  },

  // DATABASE
  DUPLICATE_KEY: {
    responseCode: 'MO0000',
    message: 'database.error.duplicateKey',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  MONGO_DB_QUERY_ERROR: {
    responseCode: 'MO0001',
    message: 'database.error.internalDatabase',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  DATABASE_ERROR: {
    responseCode: 'MO0002',
    message: 'database.error.internalDatabase',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // SESSION
  SESSION_NOT_FOUND: {
    responseCode: 'SE0000',
    message: 'session.error.sessionNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  // USER
  USER_NOT_FOUND: {
    responseCode: 'US0001',
    message: 'user.error.userNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },
  USER_INACTIVE: {
    responseCode: 'US0002',
    message: 'auth.error.accountInactive',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  USER_ALREADY_VERIFIED: {
    responseCode: 'US0003',
    message: 'auth.error.accountAlreadyVerified',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  USER_NOT_VERIFIED: {
    responseCode: 'US0004',
    message: 'auth.error.accountNotVerified',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  USER_NOT_AUTH_WITH_GOOGLE: {
    responseCode: 'US0005',
    message: 'user.error.userNotAuthWithGoogle',
    statusCode: HttpStatus.FORBIDDEN,
  },

  // RECAPTCHA
  RECAPTCHA_INVALID: {
    responseCode: 'RC0001',
    message: 'auth.error.invalidRecaptcha',
    statusCode: HttpStatus.FORBIDDEN,
  },
  RECAPTCHA_ERROR_HTTP: {
    responseCode: 'RC0002',
    message: 'auth.error.httpErrorRecaptcha',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // AUTH
  LOGIN_TO_MANY_ATTEMPTS: {
    responseCode: 'AU00',
    message: 'auth.error.tooManyAttempts',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
  },
  WRONG_CREDENTIALS: {
    responseCode: 'AU0002',
    message: 'auth.error.wrongCredentials',
    statusCode: HttpStatus.BAD_REQUEST,
  },
  QR_CODE_GENERATION_FAILED: {
    responseCode: 'AU0003',
    message: 'auth.error.qrCodeGenerationFailed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // Access Token
  AUTH_SESSION_NOT_FOUND: {
    responseCode: 'AU0010',
    message: 'session.error.sessionNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },
  AUTH_USER_NOT_FOUND: {
    responseCode: 'AU0011',
    message: 'user.error.userNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },
  ACCESS_TOKEN_NOT_PROVIDED: {
    responseCode: 'AU00012',
    message: 'token.error.accessToken.notProvided',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  ACCESS_TOKEN_INVALID: {
    responseCode: 'AU0013',
    message: 'token.error.accessToken.invalid',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  ACCESS_TOKEN_EXPIRED: {
    responseCode: 'AU0014',
    message: 'token.error.accessToken.resend',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  ACCESS_TOKEN_INTERNAL_ERROR: {
    responseCode: 'AU0015',
    message: 'token.error.accessToken.invalidVerification',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },

  // Two Factor
  TWO_FACTOR_CODE_INVALID: {
    responseCode: 'AU0016',
    message: 'token.error.mfa.invalidCode',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  // Verification Token
  VERIFICATION_TOKEN_INVALID: {
    responseCode: 'AU0020',
    message: 'token.error.verificationToken.invalid',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  VERIFICATION_TOKEN_EXPIRED: {
    responseCode: 'AU0021',
    message: 'token.error.verificationToken.resend',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  VERIFICATION_TOKEN_INTERNAL_ERROR: {
    responseCode: 'AU0022',
    message: 'token.error.verificationToken.invalidVerification',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  // Forgot Password Token
  FORGOT_PASSWORD_TOKEN_INVALID: {
    responseCode: 'AU0030',
    message: 'token.error.forgotPasswordToken.invalid',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  FORGOT_PASSWORD_TOKEN_EXPIRED: {
    responseCode: 'AU0031',
    message: 'token.error.forgotPasswordToken.resend',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  FORGOT_PASSWORD_TOKEN_INTERNAL_ERROR: {
    responseCode: 'A0032',
    message: 'token.error.forgotPasswordToken.invalidVerification',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  // Refresh Token
  REFRESH_TOKEN_NOT_PROVIDED: {
    responseCode: 'AU0040',
    message: 'token.error.refreshToken.notProvided',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },

  REFRESH_TOKEN_INVALID: {
    responseCode: 'AU0041',
    message: 'token.error.refreshToken.invalid',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  REFRESH_TOKEN_EXPIRED: {
    responseCode: 'AU0042',
    message: 'token.error.refreshToken.resend',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  REFRESH_TOKEN_INTERNAL_ERROR: {
    responseCode: 'AU0043',
    message: 'token.error.refreshToken.invalidVerification',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },
  REFRESH_TOKEN_INVALID_TYPE: {
    responseCode: 'AU0044',
    message: 'token.error.refreshToken.invalidType',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },

  // MFA Otp Token
  MFA_OTP_TOKEN_NOT_PROVIDED: {
    responseCode: 'MF0000',
    message: 'token.error.mfaOtpToken.notProvided',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_OTP_TOKEN_INVALID: {
    responseCode: 'MF0001',
    message: 'token.error.mfaOtpToken.invalid',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_OTP_TOKEN_EXPIRED: {
    responseCode: 'MF0002',
    message: 'token.error.mfaOtpToken.expired',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_OTP_TOKEN_INTERNAL_ERROR: {
    responseCode: 'MF0003',
    message: 'token.error.mfaOtpToken.invalidVerification',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  MFA_OTP_TOKEN_INCORRECT_TYPE: {
    responseCode: 'MF0004',
    message: 'token.error.mfaOtpToken.incorrectType',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  // MFA Auth Token
  MFA_AUTH_TOKEN_NOT_PROVIDED: {
    responseCode: 'MF0010',
    message: 'token.error.mfaAuthToken.notProvided',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_AUTH_TOKEN_INVALID: {
    responseCode: 'MF0011',
    message: 'token.error.mfaAuthToken.invalid',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_AUTH_TOKEN_EXPIRED: {
    responseCode: 'MF0012',
    message: 'token.error.mfaAuthToken.expired',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  MFA_AUTH_TOKEN_INTERNAL_ERROR: {
    responseCode: 'MF0013',
    message: 'token.error.mfaAuthToken.invalidVerification',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  // EMAIL
  EMAIL_SEND_ERROR: {
    responseCode: 'EM0000',
    message: 'email.error.emailSend',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  EMAIL_ALREADY_EXISTS: {
    responseCode: 'EM0001',
    message: 'user.error.emailExist',
    statusCode: HttpStatus.CONFLICT,
  },

  // REQUEST
  REQUEST_VALIDATION_PARAMS: {
    responseCode: 'RE0000',
    message: 'request.validation',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  REQUEST_METADATA_NOT_FOUND: {
    responseCode: 'RE0001',
    message: 'request.error.requestMetadataNotFound',
    statusCode: HttpStatus.PRECONDITION_FAILED,
  },

  TIME_STAMP_INVALID: {
    responseCode: 'RE0002',
    message: 'request.error.timestampInvalid',
    statusCode: HttpStatus.FORBIDDEN,
  },

  USER_AGENT_OS_INVALID: {
    responseCode: 'RE0003',
    message: 'request.error.userAgentOsInvalid',
    statusCode: HttpStatus.FORBIDDEN,
  },

  USER_AGENT_BROWSER_INVALID: {
    responseCode: 'R#0004',
    message: 'request.error.userAgentBrowserInvalid',
    statusCode: HttpStatus.FORBIDDEN,
  },

  // HTTP
  HTTP_BAD_REQUEST: {
    responseCode: 'HT0000',
    message: 'http.clientError.badRequest',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  HTTP_REQUEST_TIME_OUT: {
    responseCode: 'HT0001',
    message: 'http.clientError.requestTimeOut',
    statusCode: HttpStatus.REQUEST_TIMEOUT,
  },
  HTTP_SERVICE_UNAVAILABLE: {
    responseCode: 'HT0002',
    message: 'http.serverError.serviceUnavailable',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  },

  HTTP_SERVICE_UNAUTHORIZED: {
    responseCode: 'HT0003',
    message: 'http.clientError.unauthorized',
    statusCode: HttpStatus.UNAUTHORIZED,
  },
  HTTP_SERVICE_INTERNAL_SERVER_ERROR: {
    responseCode: 'HT0004',
    message: 'http.serverError.internalServerError',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // GoogleAuth Gmail
  GMAIL_OAUTH_URL_ERROR: {
    responseCode: 'GM0001',
    message: 'gmail.error.gmailAuthUrl',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  GMAIL_GET_USER_PROFILE_ERROR: {
    responseCode: 'GM0002',
    message: 'gmail.error.gmailGetUserProfile',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  GMAIL_GET_MAILS_BY_ACCOUNT_ERROR: {
    responseCode: 'GM0003',
    message: 'gmail.error.gmailGetMailsByAccount',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  GMAIL_ACCOUNT_NOT_FOUND: {
    responseCode: 'GM0004',
    message: 'gmail.error.gmailAccountNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  GMAIL_INVALID_ACCOUNT: {
    responseCode: 'GM0005',
    message: 'gmail.error.gmailInvalidAccount',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  GMAIL_REFRESH_TOKEN_NOT_FOUND: {
    responseCode: 'GM0006',
    message: 'gmail.error.gmailRefreshTokenNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  GMAIL_REFRESH_TOKEN_ERROR: {
    responseCode: 'GM0007',
    message: 'gmail.error.gmailRefreshToken',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // Stripe
  STRIPE_SECRET_KEY_NOT_FOUND: {
    responseCode: 'ST0000',
    message: 'stripe.error.secretKeyNotFound',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  STRIPE_WEBHOOK_SECRET_NOT_FOUND: {
    responseCode: 'ST0001',
    message: 'stripe.error.webhookSecretKeyNotFound',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  STRIPE_UNSUPPORTED_EVENT_TYPE: {
    responseCode: 'ST0002',
    message: 'stripe.error.unsupportedEventType',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  STRIPE_WEBHOOK_ERROR: {
    responseCode: 'ST0003',
    message: 'stripe.error.webhookError',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  INVALID_PAYMENT_INTENT_ID: {
    responseCode: 'ST0004',
    message: 'stripe.error.invalidPaymentIntentId',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  INVALID_SUBSCRIPTION_ID: {
    responseCode: 'ST0005',
    message: 'stripe.error.invalidSubscriptionId',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  INVALID_PRICE_ID: {
    responseCode: 'ST0006',
    message: 'stripe.error.invalidPriceId',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  SUBSCRIPTION_NOT_FOUND: {
    responseCode: 'ST0007',
    message: 'stripe.error.subscriptionNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  // Api key
  API_KEY_NEEDED_ERROR: {
    responseCode: 'AK0001',
    message: 'apiKey.error.keyNeeded',
    statusCode: HttpStatus.NOT_FOUND,
  },
  API_KEY_NOT_FOUND_ERROR: {
    responseCode: 'AK0002',
    message: 'apiKey.error.notFound',
    statusCode: HttpStatus.NOT_FOUND,
  },
  API_KEY_NOT_ACTIVE_YET_ERROR: {
    responseCode: 'AK0003',
    message: 'apiKey.error.notActiveYet',
    statusCode: HttpStatus.NOT_FOUND,
  },
  API_KEY_EXPIRED_ERROR: {
    responseCode: 'AK0004',
    message: 'apiKey.error.expired',
    statusCode: HttpStatus.NOT_FOUND,
  },
  API_KEY_INVALID_ERROR: {
    responseCode: 'AK0005',
    message: 'apiKey.error.invalid',
    statusCode: HttpStatus.NOT_FOUND,
  },

  // Turnstile
  TURNSTILE_SECRET_KEY_NOT_PROVIDED: {
    responseCode: 'TU0001',
    message: 'turnstile.error.secretNotFound',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  TURNSTILE_INTERNAL_ERROR: {
    responseCode: 'TU0002',
    message: 'turnstile.error.errorDuringVerification',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  TURNSTILE_TOKEN_NOT_PROVIDED: {
    responseCode: 'TU0003',
    message: 'turnstile.error.codeNotFound',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  TURNSTILE_FAILED_VERIFICATION: {
    responseCode: 'TU0004',
    message: 'turnstile.error.errorDuringVerification',
    statusCode: HttpStatus.FORBIDDEN,
  },

  // Workspace
  WORKSPACE_NOT_FOUND: {
    responseCode: 'WO0001',
    message: 'workspace.error.workspaceNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  WORKSPACE_DEFAULT_PROFILE_NOT_FOUND: {
    responseCode: 'WO0002',
    message: 'workspace.error.defaultProfileNotFound',
    statusCode: HttpStatus.NOT_FOUND,
  },

  WORKSPACE_ALREADY_HAS_SUBDOMAIN: {
    responseCode: 'WO0003',
    message: 'workspace.error.alreadyHasSubdomain',
    statusCode: HttpStatus.CONFLICT,
  },
} as const satisfies Record<string, IErrorCodeItem>;

export type ErrorCodesType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
