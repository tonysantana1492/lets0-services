import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { TwoFactorEnableDto } from './mfa-enable.dto';

export class TwoFactorAuthCodeDto extends TwoFactorEnableDto {
  @ApiProperty({ type: String, example: '', required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ type: String, example: '', required: true })
  @IsString()
  @IsNotEmpty()
  fingerprint;
}
