import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IGoogleConfigInterface } from '@/common/app-config/interfaces/google.config.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

@Injectable()
export class GoogleRecaptchaService {
  private readonly googleConfig: IGoogleConfigInterface;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.googleConfig = this.appConfigService.googleConfig;
  }

  async verifyRecaptcha(recaptchaResponse: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.googleConfig.recaptcha.url, null, {
          params: {
            secret: this.googleConfig.recaptcha.secret,
            response: recaptchaResponse,
          },
        }),
      );

      return Boolean(response.data.success);
    } catch (error) {
      throw new AppRequestException({ ...ERROR_CODES.RECAPTCHA_ERROR_HTTP, errors: [error] });
    }
  }
}
