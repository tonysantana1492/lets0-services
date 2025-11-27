import type { ITurnstileConfigInterface } from '@/common/app-config/interfaces/turnstile.interface';
import type {
  IAsyncTurnstileOptions,
  ITurnstileOptions,
} from '@/common/cloudflare/turnstile/interfaces/turnstile.interface';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

export default registerAs(
  'turnstile',
  (): ITurnstileConfigInterface => ({
    secretKey: process.env.CLOUDFLARE_TURNSTILE_PRIVATE_KEY ?? '',
    baseUrl: 'https://challenges.cloudflare.com',
  }),
);

export const TurnstileModuleAsyncOptions: IAsyncTurnstileOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): ITurnstileOptions => {
    const secretKey = (config.get('turnstile') as ITurnstileConfigInterface).secretKey;

    if (!secretKey) throw new AppRequestException(ERROR_CODES.TURNSTILE_SECRET_KEY_NOT_PROVIDED);

    return {
      secretKey,
      tokenResponse: (req) => req.headers['x-turnstile-token'], //req.body.turnstileToken,
    };
  },
};
