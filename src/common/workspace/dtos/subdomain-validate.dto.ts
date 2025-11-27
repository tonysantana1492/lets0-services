import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class SubdomainValidateQueryDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  subdomain: string;
}
