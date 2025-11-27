import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfileCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';
import { ProfileSchema } from '@/features/profile/repository/entities/profile.entity';
import { ProfileModel } from '@/features/profile/repository/models/profile.model';

@Module({
  providers: [ProfileModel],
  exports: [ProfileModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: ProfileCollectionName,
          schema: ProfileSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class ProfileRepositoryModule {}
