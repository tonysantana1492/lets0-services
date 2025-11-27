import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class AccountForgotPasswordDto {
  @ApiProperty({
    example: 'test@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;
}
