import { PartialType } from '@nestjs/swagger';

import { CreatePriceDto } from '@/common/stripe/dtos/create-price.dto';

export class UpdatePriceDto extends PartialType(CreatePriceDto) {}
