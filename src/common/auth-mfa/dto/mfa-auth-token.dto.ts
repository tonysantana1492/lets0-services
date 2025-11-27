import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class AuthTokenParamDto {
  @ApiProperty({ type: String, example: '', required: true })
  @IsNotEmpty()
  @IsString()
  authToken: string;
}
