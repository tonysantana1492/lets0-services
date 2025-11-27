import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { HelperTokenService } from '@/common/helpers/services/helper.token.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { AuthService } from '../auth.service';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly helperTokenService: HelperTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestDefault>();

    const { refreshToken } = this.helperTokenService.extractTokenFromCookies(request);

    if (!refreshToken) throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_NOT_PROVIDED);

    const isValid = await this.authService.checkSessionWithRefreshToken({ refreshToken });
    return Boolean(isValid);
  }
}
