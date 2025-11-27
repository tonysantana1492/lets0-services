import { Module } from '@nestjs/common';

import { AppLoggerService } from './app-logger.service';
import { LogsService } from './app-persist-logger.service';
import { LogRepositoryModule } from './repository/log.repository.module';

@Module({
  imports: [LogRepositoryModule],
  providers: [AppLoggerService, LogsService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
