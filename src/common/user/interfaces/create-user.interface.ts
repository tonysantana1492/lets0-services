import { PickType } from '@nestjs/swagger';

import { UserEntity } from '../repository/entities/user.entity';

export class ICreateUser extends PickType(UserEntity, [
  'email',
  'firstName',
  'lastName',
  'isRegisteredWithGoogle',
  'emailVerified',
  'avatar',
  'workspaceId',
] as const) {}
