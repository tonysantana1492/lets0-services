import { Injectable } from '@nestjs/common';

import { ValidationError } from 'class-validator';
import { I18nService } from 'nestjs-i18n';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IErrors } from '@/common/error/interfaces/error.interface';
import {
  IMessageOptions,
  IMessageSetOptions,
} from '@/common/language/interfaces/language.interface';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import { I18nPath, I18nTranslations } from '@/languages/generated/i18n.generated';

@Injectable()
export class LanguageService {
  private readonly appDefaultLanguage: string;

  private readonly languageCookieKey: string;

  private readonly appDefaultAvailableLanguage: string[];

  constructor(
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly appConfigService: AppConfigService,
  ) {
    const { language, availableLanguage, languageCookieKey } = this.appConfigService.messageConfig;

    this.languageCookieKey = languageCookieKey;
    this.appDefaultLanguage = language;
    this.appDefaultAvailableLanguage = availableLanguage;
  }

  getRequestLanguage(request: IRequestDefault): string | undefined {
    return request.cookies[this.languageCookieKey];
  }

  /**
   * Returns the list of available languages in the application.
   *
   * @return {string[]} - The array of available languages.
   */
  getAvailableLanguages(): string[] {
    return this.appDefaultAvailableLanguage;
  }

  /**
   * Retrieves the default language of the application.
   *
   * @returns {string} The default language of the application.
   */
  getLanguage(): string {
    return this.appDefaultLanguage;
  }

  /**
   * Filters the custom languages array with the default available language array.
   *
   * @param {string[]} customLanguages - The array of custom languages to filter.
   * @return {string[]} - The filtered array of languages.
   */
  filterLanguage(customLanguages: string[]): string[] {
    if (!customLanguages || !Array.isArray(customLanguages)) {
      return [this.appDefaultLanguage];
    }

    return customLanguages.filter((item) => this.appDefaultAvailableLanguage.includes(item));
  }

  /**
   * Sets the message for a given language and key.
   *
   * @param {string} lang - The language code.
   * @param {string} key - The key of the message to set.
   * @param {IMessageSetOptions} [options] - Optional options object.
   *
   * @returns {string} The translated message.
   */
  setMessage(lang: string, key: I18nPath, options?: IMessageSetOptions): string {
    return this.i18n.translate(key, {
      lang,
      args: options?.properties,
    });
  }

  /**
   * Retrieves the error messages from the given request errors.
   *
   * @param {ValidationError[]} requestErrors - The array of validation errors returned from DTO class validation.
   * @returns {IErrors[]} - The array of error messages with properties associated with each error.
   */
  getDtoClassErrorsMessage(requestErrors: ValidationError[]): IErrors[] {
    const messages: IErrors[][] = [];

    for (const requestError of requestErrors) {
      if (requestError instanceof ValidationError) {
        // Handle validation errors of Dtos
        let children: ValidationError[] | undefined = requestError.children;
        let constraints: string[] = Object.values(requestError.constraints ?? {});
        let property: string = requestError.property;
        let errors: IErrors[] = [];

        if (children && children?.length > 0) {
          while (children && children?.length > 0) {
            property = `${property}.${children[0].property}`;

            if (
              children &&
              children.length > 0 &&
              children[0].children &&
              children[0].children.length > 0
            ) {
              children = children[0].children;
            } else {
              constraints = Object.values(children[0]?.constraints ?? {});
              children = [];
            }
          }
        }

        if (constraints && constraints.length > 0) {
          errors = constraints.map((constraint) => ({
            property,
            message: constraint,
          }));
        }

        messages.push(errors);
      } else {
        // Handle errors from CustomException
        messages.push(requestError);
      }
    }

    return messages.flat();
  }

  /**
   * Retrieves the value of a message with the specified key.
   *
   * @template T - The type of the message value.
   * @param {string} key - The key of the message to retrieve.
   * @param {IMessageOptions} [options] - Optional configuration options.
   * @returns {T} - The value of the message.
   */
  get<T = string>(key: I18nPath, options?: IMessageOptions): T {
    const customLanguages =
      options?.customLanguages?.length && options?.customLanguages?.length > 0
        ? this.filterLanguage(options.customLanguages)
        : [this.appDefaultLanguage];

    if (customLanguages.length > 1) {
      return Object.fromEntries(
        customLanguages.map((v) => [
          v,
          this.setMessage(v, key, {
            properties: options?.properties,
          }),
        ]),
      ) as unknown as T;
    }

    return this.setMessage(customLanguages[0], key, {
      properties: options?.properties,
    }) as unknown as T;
  }
}
