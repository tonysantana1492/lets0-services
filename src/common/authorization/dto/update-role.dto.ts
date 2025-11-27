import { PickType } from '@nestjs/swagger';

import { UserEntity } from '@/common/user/repository/entities/user.entity';

export class UpdateRoleDto extends PickType(UserEntity, ['roles'] as const) {}
