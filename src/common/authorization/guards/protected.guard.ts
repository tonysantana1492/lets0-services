import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from '@/common/auth/auth.service';
import { PROTECTED_KEY } from '@/common/auth/decorators/protected.decorator';
import { PUBLIC_KEY } from '@/common/auth/decorators/public.decorator';
import { JwtGuard } from '@/common/auth/guards/jwt.guard';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { ROLE } from '@/common/authorization/enums/role.enum';
import { HelperTokenService } from '@/common/helpers/services/helper.token.service';

@Injectable()
export class ProtectedGuard extends JwtGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    helperTokenService: HelperTokenService,
    authService: AuthService,
  ) {
    super(reflector, helperTokenService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActive = await super.canActivate(context);

    if (!isActive) return false;

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) return true;

    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(PROTECTED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // check for token validation
    const request = context.switchToHttp().getRequest<IRequestWithUser>();
    const user = request.user;

    // this route can access by any role
    if (requiredRoles.length === 0) return true;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
