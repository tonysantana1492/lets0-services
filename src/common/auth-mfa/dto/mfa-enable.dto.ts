import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorEnableDto {
  @ApiProperty({ type: String, example: '1234', required: true })
  @IsString()
  @IsNotEmpty()
  code: string;
}
