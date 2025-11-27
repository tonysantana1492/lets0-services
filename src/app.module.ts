import { Module } from '@nestjs/common';

import { CommonModule } from '@/common/common.module';
import { CoreModule } from '@/features/core.module';

@Module({
  imports: [CommonModule, CoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
