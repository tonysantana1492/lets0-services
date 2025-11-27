import { PartialType } from '@nestjs/swagger';

import { CreateProductDto } from '@/common/stripe/dtos/create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
