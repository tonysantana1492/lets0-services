import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { HelperTokenService } from '@/common/helpers/services/helper.token.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { AuthService } from '../auth.service';
import { PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    private readonly helperTokenService: HelperTokenService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) return true;

    const request = context.switchToHttp().getRequest<IRequestDefault>();

    const { accessToken, refreshToken } = this.helperTokenService.extractTokenFromCookies(request);

    if (!refreshToken) throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_NOT_PROVIDED);

    if (!refreshToken) {
      throw new AppRequestException(ERROR_CODES.REFRESH_TOKEN_NOT_PROVIDED);
    }

    if (!accessToken) {
      throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_NOT_PROVIDED);
    }

    const { payload, user, isExpired } = await this.authService.checkSessionWithAccessToken({
      accessToken,
    });

    if (isExpired) {
      await this.authService.checkSessionWithRefreshToken({
        refreshToken,
      });

      const { accessTokenCookie } = this.helperTokenService.generateCookieWithJwtAccessToken({
        userId: payload.data.userId,
        email: payload.data.email,
        sessionId: payload.data.sessionId,
      });

      if (request.res) {
        request.res.setHeader('Set-Cookie', [accessTokenCookie]);
      }
    }

    request.user = user;
    return true;
  }
}
