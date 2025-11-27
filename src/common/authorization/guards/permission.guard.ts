import type { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { mixin } from '@nestjs/common';

import type { IRequestWithUser } from '../../auth/interfaces/request-with-user.interface';
import type { IPermission } from '../types/permission.type';
import { JwtGuard } from '../../auth/guards/jwt.guard';

export const PermissionGuard = (permissions: IPermission[]): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const isActive = await super.canActivate(context);

      if (!isActive) return false;

      const request = context.switchToHttp().getRequest<IRequestWithUser>();
      const user = request.user;

      return permissions.some((permission) => user.permissions.includes(permission));
    }
  }

  return mixin(PermissionGuardMixin);
};
