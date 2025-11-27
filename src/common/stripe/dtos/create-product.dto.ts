import { PickType } from '@nestjs/swagger';

import { ProductEntity } from '@/common/stripe/repository/entity/product.entity';

export class CreateProductDto extends PickType(ProductEntity, [
  'active',
  'description',
  'name',
  'metadata',
] as const) {}
