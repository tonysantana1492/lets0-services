import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateOtpTokenDto {
  @ApiProperty({ type: String, example: '', required: true })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
