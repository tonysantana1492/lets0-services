import { Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Protected } from '@/common/auth/decorators/protected.decorator';
import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import {
  PaginationQuery,
  PaginationQueryFilterInBoolean,
} from '@/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from '@/common/pagination/dtos/pagination.list.dto';
import { ResponseHttp, ResponseHttpPaging } from '@/common/response/decorators/response.decorator';
import { IResponsePaging } from '@/common/response/interfaces/response.interface';

import {
  NOTIFICATION_DEFAULT_AVAILABLE_ORDER_BY,
  NOTIFICATION_DEFAULT_AVAILABLE_SEARCH,
} from '../constants/notification.enum';
import { NotificationService } from '../services/notification.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('test')
  @ResponseHttp('notification.update')
  @Protected()
  async test() {
    await this.notificationService.notifyOrderCommentAdded({
      type: '',
      note: 'Hello',
      files: [],
      postedAs: '',
      author: {
        name: 'Test',
        email: '',
        avatarURL: '',
      },
      createdAt: '',
    });
  }

  @Patch('/:id/read')
  @ResponseHttp('notification.update')
  @Protected()
  async markAsRead(@Param('id') id: string) {
    const data = await this.notificationService.markAsRead(id);

    return { data };
  }

  @Get('/')
  @ResponseHttpPaging('notification.findAllByUser')
  @Protected()
  async findAllByRetailer(
    @PaginationQuery({
      availableSearch: NOTIFICATION_DEFAULT_AVAILABLE_SEARCH,
      availableOrderBy: NOTIFICATION_DEFAULT_AVAILABLE_ORDER_BY,
    })
    pagination: PaginationListDto,
    @PaginationQueryFilterInBoolean('isRead', [true]) isReadFilter: Record<string, boolean>,
    @Req() { user }: IRequestWithUser,
  ): Promise<IResponsePaging> {
    return this.notificationService.getPaginated(user.id, pagination, isReadFilter);
  }

  @Get('/latest')
  @ResponseHttp('notification.findLatestByUser')
  @Protected()
  async findLatestByRetailer(@Req() { user }: IRequestWithUser) {
    const data = await this.notificationService.getLatestNotifications(user.id);

    return { data };
  }

  @Delete('/:id')
  @ResponseHttp('notification.delete')
  @Protected()
  async delete(@Param('id') id: string) {
    await this.notificationService.deleteOneOrThrow(id);
  }
}
