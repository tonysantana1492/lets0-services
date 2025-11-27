import { applyDecorators, SetMetadata } from '@nestjs/common';

import { Doc } from '@/common/doc/decorators/doc.decorator';

export const PUBLIC_KEY = 'public';

export const Public = () => applyDecorators(Doc(), SetMetadata(PUBLIC_KEY, true));
