import type { MongooseModuleOptions } from '@nestjs/mongoose';

export interface IDatabaseOptionsService {
  createOptions(db: string): MongooseModuleOptions;
}
