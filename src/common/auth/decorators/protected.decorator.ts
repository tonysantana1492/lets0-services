import type { ROLE } from '@/common/authorization/enums/role.enum';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { Doc } from '@/common/doc/decorators/doc.decorator';

export const PROTECTED_KEY = 'protected';
export const Protected = (...role: ROLE[]) =>
  applyDecorators(Doc(), ApiBearerAuth(), SetMetadata(PROTECTED_KEY, role));
