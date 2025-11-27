import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserCollectionName } from '@/common/database/constants/collection-names.constant';
import { MAIN_DB_CONNECTION_NAME } from '@/common/database/constants/database.constant';

import { UserSchema } from './entities/user.entity';
import { UserModel } from './models/user.model';

@Module({
  providers: [UserModel],
  exports: [UserModel],
  controllers: [],
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: UserCollectionName,
          schema: UserSchema,
        },
      ],
      MAIN_DB_CONNECTION_NAME,
    ),
  ],
})
export class UserRepositoryModule {}
