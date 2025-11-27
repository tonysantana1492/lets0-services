import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';

import { catchError, firstValueFrom } from 'rxjs';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ITurnstileConfigInterface } from '@/common/app-config/interfaces/turnstile.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

import { ITurnstileOptions } from '../interfaces/turnstile.interface';

@Injectable()
export class TurnstileService {
  private readonly turnstileConfig: ITurnstileConfigInterface;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    @Inject('TurnstileServiceOptions') private readonly options: ITurnstileOptions,
  ) {
    this.turnstileConfig = this.appConfigService.turnstileConfig;
  }

  async validateToken(token: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.turnstileConfig.baseUrl}/turnstile/v0/siteverify`, {
          response: token,
          secret: this.options.secretKey,
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((error) => {
            if (this.options.onError) this.options.onError(error);

            throw new AppRequestException({
              ...ERROR_CODES.TURNSTILE_INTERNAL_ERROR,
              errors: [error],
            });
          }),
        ),
    );

    return data;
  }
}
