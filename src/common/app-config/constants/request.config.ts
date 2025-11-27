import type { IRequestConfig } from '@/common/app-config/interfaces/request.config.interface';
import { registerAs } from '@nestjs/config';

import bytes from 'bytes';
import ms from 'ms';

import {
  ENUM_BROWSER,
  ENUM_OPERATING_SYSTEM,
  ENUM_REQUEST_HEADER,
  ENUM_REQUEST_METHOD,
} from '@/common/app-config/enums/request.enum';
import { seconds } from '@/common/helpers/constants/helper.function.constant';

export default registerAs(
  'request',
  (): IRequestConfig => ({
    body: {
      json: {
        maxFileSize: bytes('100kb') ?? 0, // 100kb
      },
      raw: {
        maxFileSize: bytes('5.5mb') ?? 0, // 5.5mb
      },
      text: {
        maxFileSize: bytes('100kb') ?? 0, // 100kb
      },
      urlencoded: {
        maxFileSize: bytes('100kb') ?? 0, // 100kb
      },
    },
    timestamp: {
      toleranceTimeInMs: ms('5m'), // 5 mins
    },
    timeout: ms('500s'), // 30s based on ms module
    userAgent: {
      os: Object.values(ENUM_OPERATING_SYSTEM),
      browser: Object.values(ENUM_BROWSER),
    },
    cors: {
      allowMethod: Object.values(ENUM_REQUEST_METHOD),
      allowOrigin: process.env.CLIENT_URL ?? '*',
      // allowOrigin: [/example\.com(\:\d{1,4})?$/], // allow all subdomain, and all port
      // allowOrigin: [/example\.com$/], // allow all subdomain without port
      allowHeader: Object.values(ENUM_REQUEST_HEADER),
    },
    throttle: {
      ttl: seconds('500'), // 0.5 secs
      limit: 10, // max request per reset time
    },
    cookies: {
      token: 'wklvdvl2.56gff',
    },
  }),
);
