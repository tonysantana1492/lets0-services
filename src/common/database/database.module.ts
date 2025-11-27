import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';

import { MAIN_DB_CONNECTION_NAME } from './constants/database.constant';
import { DatabaseOptionsModule } from './database.options.module';
import { DatabaseOptionsService } from './services/database.options.service';

@Module({
  providers: [],
  exports: [],
  imports: [
    MongooseModule.forRootAsync({
      connectionName: MAIN_DB_CONNECTION_NAME,
      imports: [DatabaseOptionsModule],
      inject: [DatabaseOptionsService, AppConfigService],
      useFactory: async (
        databaseOptionsService: DatabaseOptionsService,
        appConfigService: AppConfigService,
      ) => databaseOptionsService.createOptions(appConfigService.databaseConfig.mainDatabase),
    }),
  ],
})
export class DatabaseModule {}
