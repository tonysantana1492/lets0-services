import type { IEmailConfigInterface } from '@/common/app-config/interfaces/email.config.interface';
import type { MailerAsyncOptions } from '@/common/mailer/interfaces/mailer-async-options.interface';
import type { I18nTranslations } from '@/languages/generated/i18n.generated';
import type { PathImpl2 } from '@nestjs/config';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';

import { LanguageModule } from '@/common/language/language.module';
import { LanguageService } from '@/common/language/services/language.service';
import { HandlebarsAdapter } from '@/common/mailer/adapters/handlebars.adapter';

export default registerAs(
  'email',
  (): IEmailConfigInterface => ({
    host: process.env.EMAIL_HOST ?? 'smtp.mailtrap.io',
    port: Number(process.env.EMAIL_PORT ?? 2525),
    secure: process.env.EMAIL_IS_SECURE === 'true' ? true : false,
    user: process.env.EMAIL_USER ?? 'user',
    password: process.env.EMAIL_PASSWORD ?? 'password',
    from: process.env.EMAIL_FROM ?? '',
    confirmationLink: process.env.EMAIL_CONFIRMATION_URL ?? process.env.APP_URL ?? '',
  }),
);

export const getHandlebarsHelpers = (languageService: LanguageService) => ({
  t: (key: PathImpl2<I18nTranslations>, args: any, options: any) => {
    if (!options) {
      options = args;
    }

    return languageService.get(key);
  },
});

export const emailModuleAsyncOptionsLocal: MailerAsyncOptions = {
  imports: [ConfigModule, LanguageModule],
  inject: [ConfigService, LanguageService],
  useFactory: (configService: ConfigService, languageService: LanguageService) => ({
    transport: {
      host: configService.get('email.host'),
      port: configService.get('email.port'),
      secure: configService.get('email.secure'),
      auth: {
        user: configService.get('email.user'),
        pass: configService.get('email.password'),
      },
    },
    defaults: {
      from: '"No Reply" <no-reply@localhost>',
    },
    preview: false,
    template: {
      dir: process.cwd() + '/templates/',
      adapter: new HandlebarsAdapter(getHandlebarsHelpers(languageService)),
      options: {
        strict: true,
      },
    },
  }),
};

// export const emailModuleAsyncOptions: MailerAsyncOptions = {
//   imports: [ConfigModule, I18nModule],
//   inject: [ConfigService, I18nService],
//   useFactory: (configService: ConfigService, i18nService: I18nService) => ({
//     // transport: 'smtps://user@domain.com:pass@smtp.domain.com',
//     host: configService.get('email.host'),
//     port: configService.get('email.port'),
//     secure: configService.get('email.secure'),
//     auth: {
//       user: configService.get('email.user'),
//       pass: configService.get('email.password'),
//     },
//     from: configService.get('email.from'),
//     template: {
//       dir: __dirname + '/templates/',
//       adapter: new HandlebarsAdapter(getHandlebarsHelpers(i18nService)),
//       options: {
//         strict: true,
//       },
//     },
//   }),
// };
