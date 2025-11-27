import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

import { ITurnstileOptions } from '../interfaces/turnstile.interface';
import { TurnstileService } from '../services/turnstile.service';

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(
    private readonly turnstileService: TurnstileService,
    @Inject('TurnstileServiceOptions')
    private readonly options: ITurnstileOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const turnstileToken = this.options.tokenResponse(request);

    if (!turnstileToken) throw new AppRequestException(ERROR_CODES.TURNSTILE_TOKEN_NOT_PROVIDED);

    const { success } = await this.turnstileService.validateToken(turnstileToken);

    if (success) return success;

    throw new AppRequestException(ERROR_CODES.TURNSTILE_FAILED_VERIFICATION);
  }
}
