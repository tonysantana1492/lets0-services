import { PickType } from '@nestjs/swagger';

import { UserEntity } from '@/common/user/repository/entities/user.entity';

export class RegisterDto extends PickType(UserEntity, [
  'firstName',
  'lastName',
  'email',
] as const) {}
