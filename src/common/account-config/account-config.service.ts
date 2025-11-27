import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import { ERROR_CODES } from '../error/constants/error-code';
import { AppRequestException } from '../error/exceptions/app-request.exception';
import { AccountConfigDoc, AccountConfigEntity } from './repository/entities/account-config.entity';
import { AccountConfigModel } from './repository/models/account-config.model';

@Injectable()
export class AccountConfigService {
  constructor(private readonly accountConfigModel: AccountConfigModel) {}

  public async getAccountConfig({ userId }: { userId: string }): Promise<AccountConfigDoc> {
    const config = await this.accountConfigModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!config) throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_EXPIRED);

    return config;
  }

  public async upsertAccountConfig({
    body,
    userId,
  }: {
    body: AccountConfigEntity;
    userId: string;
  }): Promise<AccountConfigDoc> {
    const config = await this.accountConfigModel.updateOne(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        ...body,
        userId: new Types.ObjectId(userId),
      },
      { upsert: true },
    );

    if (!config) throw new AppRequestException(ERROR_CODES.ACCESS_TOKEN_EXPIRED);

    return config;
  }
}
