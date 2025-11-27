import type { IDatabaseConfigInterface } from '@/common/app-config/interfaces/database.config.interface';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'database',
  (): IDatabaseConfigInterface => ({
    mongoUrl: process.env.MONGO_URL ?? 'mongodb://localhost:27017',
    debug: process.env.DATABASE_DEBUG === 'true' ? true : false,
    options: process.env.DATABASE_OPTIONS ?? '',

    mainDatabase: process.env.DATABASE_MAIN_NAME ?? 'db',
  }),
);
