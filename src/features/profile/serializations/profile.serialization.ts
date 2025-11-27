import { ApiProperty } from '@nestjs/swagger';

import { ProfileEntity } from '@/features/profile/repository/entities/profile.entity';

export class ProfileSerialization {
  @ApiProperty({
    name: 'profile',
    type: ProfileEntity,
    required: true,
    nullable: false,
    description: 'returns profile',
  })
  readonly profile: ProfileEntity;
}
