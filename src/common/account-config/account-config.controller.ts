import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DocRequest } from '@/common/doc/decorators/doc.decorator';

import { Protected } from '../auth/decorators/protected.decorator';
import { IRequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ResponseHttp } from '../response/decorators/response.decorator';
import { AccountConfigService } from './account-config.service';
import { AccountConfigEntity } from './repository/entities/account-config.entity';

@Controller('account-config')
@ApiTags('account-config')
export class AccountConfigController {
  constructor(private readonly accountConfigService: AccountConfigService) {}

  @Get('/')
  @Protected()
  @ResponseHttp()
  async getAccountConfig(@Req() { user }: IRequestWithUser) {
    const config = await this.accountConfigService.getAccountConfig({ userId: user.id });
    return {
      data: {
        config,
      },
    };
  }

  @Patch('/')
  @Protected()
  @DocRequest({ body: AccountConfigEntity })
  @ResponseHttp()
  async upsertAccountConfig(@Body() body: AccountConfigEntity, @Req() { user }: IRequestWithUser) {
    const config = await this.accountConfigService.upsertAccountConfig({ body, userId: user.id });
    return {
      data: {
        config,
      },
    };
  }
}
