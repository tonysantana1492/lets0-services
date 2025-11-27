import path from 'path';
import { Global, Module } from '@nestjs/common';

import { HeaderResolver, I18nModule } from 'nestjs-i18n';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ENUM_LANGUAGE } from '@/common/language/enums/language.enum';
import { LanguageService } from '@/common/language/services/language.service';

@Global()
@Module({
  providers: [LanguageService],
  exports: [LanguageService],
  imports: [
    I18nModule.forRootAsync({
      useFactory: (appConfigService: AppConfigService) => ({
        fallbackLanguage: appConfigService.messageConfig.availableLanguage?.join(','),
        fallbacks: Object.fromEntries(Object.values(ENUM_LANGUAGE).map((v) => [`${v}-*`, v])),
        loaderOptions: {
          path: path?.join(process.cwd(), 'src/languages'),
          watch: true,
        },
        typesOutputPath: path.join(process.cwd(), 'src/languages/generated/i18n.generated.ts'),
      }),
      // loader: I18nJsonLoader,
      inject: [AppConfigService],
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
  ],
  controllers: [],
})
export class LanguageModule {}
