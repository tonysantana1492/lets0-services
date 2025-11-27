import { Injectable } from '@nestjs/common';

import { LogEntity } from '@/common/app-logger/repository/entities/log.entity';

import { LogModel } from './repository/models/log.model';

@Injectable()
export class LogsService {
  constructor(readonly logModel: LogModel) {}

  async createLog(logDto: LogEntity) {
    const newLog = await this.logModel.create(logDto, { skipTransaction: true });
    return newLog;
  }
}
