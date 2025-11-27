import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AccountCreatePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'LongPassword*',
    required: true,
  })
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*@^])[\d!#$%&()*@A-Z^a-z]+$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '2f45hk5hk61lglsl9',
    required: true,
  })
  token: string;
}
