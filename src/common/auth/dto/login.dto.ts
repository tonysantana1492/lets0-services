import { ApiPropertyOptional, PickType } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { UserEntity } from '@/common/user/repository/entities/user.entity';

export class LogInDto extends PickType(UserEntity, ['email'] as const) {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsNotEmpty()
  fingerprint: string;
}
