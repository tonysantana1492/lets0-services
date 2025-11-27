import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class AccountVerifyDto {
  @ApiProperty({
    type: 'string',
    example:
      'U2FsdGVkX188G2c+Q9iX5Zz75zyOhfYK/Zeqa0w3AedHS7FjqEy5c1DYh8Dk9JtOD4Zc/8UvUJIQNFS6hwPY9sSufqCeGbFRxN9sgtW/JnFMBqKctY5Z5',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
