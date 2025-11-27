import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspaceCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { WorkspaceSchema } from '@/common/workspace/repository/entities/workspace.entity';
import { WorkspaceModel } from '@/common/workspace/repository/models/workspace.model';

@Module({
  providers: [WorkspaceModel],
  exports: [WorkspaceModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: WorkspaceCollectionName,
          schema: WorkspaceSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class WorkspaceRepositoryModule {}
