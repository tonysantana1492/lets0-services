import { ApiProperty, PickType } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { UserEntity } from '@/common/user/repository/entities/user.entity';

export class UpdatePermissionsDto extends PickType(UserEntity, ['permissions'] as const) {}

export class PermissionsParamsDto {
  @ApiProperty({ type: String, example: '23244' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
