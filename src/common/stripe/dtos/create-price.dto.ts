import { PickType } from '@nestjs/swagger';

import { PriceEntity } from '@/common/stripe/repository/entity/price.entity';

export class CreatePriceDto extends PickType(PriceEntity, [
  'active',
  'description',
  'unitAmount',
  'currency',
  'type',
  'interval',
  'intervalCount',
  'trialPeriodDays',
  'metadata',
] as const) {}
