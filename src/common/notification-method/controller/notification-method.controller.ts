import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected } from '@/common/auth/decorators/protected.decorator';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { IdParamDto } from '@/common/notification-method/dtos/id-param.dto';
import { PaginationQuery } from '@/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from '@/common/pagination/dtos/pagination.list.dto';
import { ResponseHttp, ResponseHttpPaging } from '@/common/response/decorators/response.decorator';
import { IResponsePaging } from '@/common/response/interfaces/response.interface';

import {
  NOTIFICATION_METHOD_DEFAULT_AVAILABLE_ORDER_BY,
  NOTIFICATION_METHOD_DEFAULT_AVAILABLE_SEARCH,
} from '../constants/notification-method.enum';
import { CreateNotificationMethodDto } from '../dtos/create-notification-method.dto';
import { UpdateNotificationMethodDto } from '../dtos/update-notification-method.dto';
import { NotificationMethodService } from '../services/notification-method.service';

@ApiTags('notification-method')
@Controller({ path: '/notification-methods', version: VERSION_NEUTRAL })
export class NotificationMethodController {
  constructor(private readonly notificationMethodService: NotificationMethodService) {}

  @Post('/')
  @ResponseHttp('notificationMethod.create')
  @DocRequest({ body: CreateNotificationMethodDto })
  @Protected()
  async create(@Body() dto: CreateNotificationMethodDto) {
    const data = await this.notificationMethodService.create(dto);

    return { data };
  }

  @Get('/:id')
  @Protected()
  @ResponseHttp('notificationMethod.findOne')
  @DocRequest({ body: CreateNotificationMethodDto })
  async findOne(@Param() { id }: IdParamDto) {
    const data = await this.notificationMethodService.findOneOrThrow(id);

    return { data };
  }

  @Patch('/:id')
  @Protected()
  @DocRequest({ params: IdParamDto })
  @ResponseHttp('notificationMethod.update')
  async update(@Param() { id }: IdParamDto, @Body() dto: UpdateNotificationMethodDto) {
    const data = await this.notificationMethodService.updateOneOrThrow(id, dto);

    return { data };
  }

  @Get('/')
  @Protected()
  @DocRequest({ params: IdParamDto })
  @ResponseHttpPaging('notificationMethod.findAllByUser')
  async findAllByRetailer(
    @PaginationQuery({
      availableSearch: NOTIFICATION_METHOD_DEFAULT_AVAILABLE_SEARCH,
      availableOrderBy: NOTIFICATION_METHOD_DEFAULT_AVAILABLE_ORDER_BY,
    })
    pagination: PaginationListDto,
    @Req() { user }: IRequestWithUser,
  ): Promise<IResponsePaging> {
    return this.notificationMethodService.getPaginated(user.id, pagination);
  }

  @Delete('/:id')
  @Protected()
  @DocRequest({ params: IdParamDto })
  @ResponseHttp('notificationMethod.delete')
  async delete(@Param() { id }: IdParamDto) {
    await this.notificationMethodService.deleteOneOrThrow(id);
  }
}
