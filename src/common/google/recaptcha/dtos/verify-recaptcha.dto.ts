import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRecaptchaDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
  recaptchaValue: string;
}
