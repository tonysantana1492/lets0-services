import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Doc } from '@/common/doc/decorators/doc.decorator';

import type { IPermission } from '../types/permission.type';
import { PermissionGuard } from '../guards/permission.guard';

export const Permission = (...permissions: IPermission[]) =>
  applyDecorators(Doc(), ApiBearerAuth(), UseGuards(PermissionGuard(permissions)));
