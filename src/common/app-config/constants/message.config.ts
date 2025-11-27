import type { IMessageConfigInterface } from '@/common/app-config/interfaces/message.config.interface';
import { registerAs } from '@nestjs/config';

import { APP_LANGUAGE } from '@/common/app-config/constants/app.constant';
import { ENUM_LANGUAGE } from '@/common/language/enums/language.enum';

export default registerAs(
  'message',
  (): IMessageConfigInterface => ({
    availableLanguage: Object.values(ENUM_LANGUAGE),
    language: process.env.LANGUAGE ?? APP_LANGUAGE,
    languageCookieKey: 'next-locale',
  }),
);
