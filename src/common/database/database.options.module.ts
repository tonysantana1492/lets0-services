import { Module } from '@nestjs/common';

import { DatabaseOptionsService } from '@/common/database/services/database.options.service';

@Module({
  providers: [DatabaseOptionsService],
  exports: [DatabaseOptionsService],
  imports: [],
})
export class DatabaseOptionsModule {}
