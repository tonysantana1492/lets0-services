import type {
  ENUM_BODY_TYPE,
  ENUM_BROWSER,
  ENUM_OPERATING_SYSTEM,
  ENUM_REQUEST_HEADER,
  ENUM_REQUEST_METHOD,
} from '@/common/app-config/enums/request.enum';

export interface IRequestConfig {
  body: {
    [ENUM_BODY_TYPE.JSON]: {
      maxFileSize: number;
    };
    [ENUM_BODY_TYPE.RAW]: {
      maxFileSize: number;
    };
    [ENUM_BODY_TYPE.TEXT]: {
      maxFileSize: number;
    };
    [ENUM_BODY_TYPE.URLENCODED]: {
      maxFileSize: number;
    };
  };

  timestamp: {
    toleranceTimeInMs: number;
  };

  timeout: number;

  userAgent: {
    os: ENUM_OPERATING_SYSTEM[];
    browser: ENUM_BROWSER[];
  };

  cors: {
    allowMethod: ENUM_REQUEST_METHOD[];
    allowOrigin: string;
    allowHeader: ENUM_REQUEST_HEADER[];
  };

  throttle: {
    ttl: number;
    limit: number;
  };

  cookies: {
    token: string;
  };
}
