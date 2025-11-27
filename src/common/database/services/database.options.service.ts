import type { IDatabaseOptionsService } from '@/common/database/interfaces/database.options-service.interface';
import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { Global, Injectable, Logger } from '@nestjs/common';

import mongoose from 'mongoose';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ENUM_APP_ENVIRONMENT } from '@/common/app-config/enums/app.enum';

@Injectable()
@Global()
export class DatabaseOptionsService implements IDatabaseOptionsService {
  private readonly logger: Logger;

  constructor(private readonly appConfigService: AppConfigService) {
    this.logger = new Logger(DatabaseOptionsService.name);
  }

  createOptions(db: string): MongooseModuleOptions {
    const { env: environment } = this.appConfigService.appConfig;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { mongoUrl, debug, options: options } = this.appConfigService.databaseConfig;

    let uri = `${mongoUrl}`;

    if (db) {
      uri = `${uri}/${db}?${options}`;
    }

    this.logger.debug('', `============================ MongoDB ================================`);
    this.logger.debug(`URI: ${mongoUrl}`, `DB: ${db}`);
    this.logger.debug('', `=====================================================================`);

    if (environment !== ENUM_APP_ENVIRONMENT.PRODUCTION) {
      mongoose.set('debug', debug);
    }

    return {
      uri,
      serverSelectionTimeoutMS: 5000,
      autoCreate: true,
      autoIndex: environment !== ENUM_APP_ENVIRONMENT.PRODUCTION,
    };
  }
}
