import type { ENUM_LANGUAGE } from '@/common/language/enums/language.enum';

export interface IMessageConfigInterface {
  availableLanguage: ENUM_LANGUAGE[];
  language: string;
  languageCookieKey: string;
}
