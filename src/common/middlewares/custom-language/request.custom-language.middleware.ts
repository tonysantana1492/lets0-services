import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { LanguageService } from '@/common/language/services/language.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import { IResponseDefault } from '@/common/response/interfaces/response.interface';

@Injectable()
export class RequestLanguageMiddleware implements NestMiddleware {
  constructor(private readonly languageService: LanguageService) {}

  /**
   * Process custom languages.
   *
   * @param {string} reqLanguages - The requested languages as a comma-separated string.
   * @param {string} language - The default language.
   * @param {string[]} availableLanguages - The available languages.
   * @return {string[]} The processed languages.
   */
  private processCustomLanguages(
    reqLanguages: string,
    language: string,
    availableLanguages: string[],
  ): string[] {
    if (!reqLanguages) {
      return [language];
    }

    const splitLanguages = reqLanguages.split(',').map((val) => val.toLowerCase());
    const languages = splitLanguages.filter((item) => availableLanguages.includes(item));

    return languages.length > 0 ? languages : [language];
  }

  /**
   * Middleware function to handle custom languages in headers.
   *
   * @param {IRequestDefault} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function to call.
   * @returns {Promise<void>} - A promise that resolves when the middleware is completed.
   */
  async use(req: IRequestDefault, response: IResponseDefault, next: NextFunction): Promise<void> {
    const reqLanguage = this.languageService.getRequestLanguage(req);
    const defaultLanguage = this.languageService.getLanguage();
    const availableLanguages = this.languageService.getAvailableLanguages();
    const language = this.processCustomLanguages(
      reqLanguage as string,
      defaultLanguage,
      availableLanguages,
    );

    req.language = language;
    req.headers['x-custom-lang'] = language.join(',');

    next();
  }
}
