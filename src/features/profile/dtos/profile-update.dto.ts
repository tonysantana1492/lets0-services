import { OmitType } from '@nestjs/swagger';

import { ProfileEntity } from '@/features/profile/repository/entities/profile.entity';

export class ProfileUpdateBodyDto extends OmitType(ProfileEntity, ['workspaceId'] as const) {}
