import { Module } from '@nestjs/common';

import { WorkspaceModule } from '@/common/workspace/workspace.module';
import { ProfileController } from '@/features/profile/profile.controller';
import { ProfileService } from '@/features/profile/profile.service';
import { ProfileRepositoryModule } from '@/features/profile/repository/profile.repository.module';

@Module({
  imports: [ProfileRepositoryModule, WorkspaceModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
