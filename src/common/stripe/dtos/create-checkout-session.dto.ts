import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  priceId: string;

  @ApiProperty({
    type: 'integer',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  successUrl: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cancelUrl: string;
}
