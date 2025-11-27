import type { PaginationListDto } from '@/common/pagination/dtos/pagination.list.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Types } from 'mongoose';

import { PubSubPublisherService } from '@/common/google/pubsub/services/pubsub-publisher.service';
import { HelperDateService } from '@/common/helpers/services/helper.date.service';
import { NotificationMethodService } from '@/common/notification-method/services/notification-method.service';
import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import { PaginationService } from '@/common/pagination/services/pagination.service';

import { ENUM_NOTIFICATION_TYPE } from '../constants/notification.enum';
import { ENUM_ORDER_STATUS } from '../constants/status.enum';
import { OrderCommentAddedEvent, OrderDoorDashEvent, OrderPlacedEvent } from '../events/pubsub';
import { IComment } from '../interfaces/comment.interface';
import { INotification } from '../interfaces/notification.interface';
import { NotificationDoc, NotificationEntity } from '../repository/entities/notification.entity';
import { NotificationModel } from '../repository/models/notification.model';

@Injectable()
export class NotificationService {
  private readonly logger: Logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepo: NotificationModel,
    private readonly paginationService: PaginationService,
    private readonly notificationMethodService: NotificationMethodService,
    private readonly pubSubPublisherService: PubSubPublisherService,
    private readonly helperDateService: HelperDateService,
  ) {}

  async create(data: Partial<INotification>): Promise<NotificationDoc> {
    const notification = new NotificationEntity(data);

    return this.notificationRepo.create(notification);
  }

  async findOneOrThrow(id: string): Promise<NotificationDoc> {
    const notification = await this.notificationRepo.findOne({
      _id: new Types.ObjectId(id),
    });

    if (!notification) {
      throw new NotFoundException('Notification  not found');
    }

    return notification;
  }

  async getPaginated(
    retailer: string,
    pagination: PaginationListDto,
    extraFilter?: Record<string, any>,
  ) {
    const find: Record<string, any> = {
      ...pagination,
      ...extraFilter,
      retailer,
    };
    const total = await this.notificationRepo.getTotal(find);
    const totalPage = this.paginationService.totalPageWithoutMax(total, pagination._limit);

    const result = await this.notificationRepo.findAll(find, {
      paging: {
        limit: pagination._limit,
        offset: pagination._offset,
      },
    });

    return {
      _pagination: {
        total,
        totalPage,
        limit: pagination._limit,
        offset: pagination._offset,
      },
      data: result,
    };
  }

  async markAsRead(id: string): Promise<NotificationDoc> {
    const notification = await this.findOneOrThrow(id);

    notification.isRead = true;

    return this.notificationRepo.save(notification);
  }

  async deleteOneOrThrow(id: string) {
    const notification = await this.findOneOrThrow(id);

    return await this.notificationRepo.softDelete(notification);
  }

  async getLatestNotifications(): Promise<NotificationDoc[]> {
    return this.notificationRepo.findAll(
      { createdAt: { $gte: this.helperDateService.backwardInDays(7) } },
      {
        sort: { createdAt: ENUM_PAGINATION_SORT_DIRECTION_TYPE.DESC },
      },
    );
  }

  async notifyOrderStatusChangeBatch(orders: any[]): Promise<void> {
    const newOrders = orders.filter((order) => order.status === ENUM_ORDER_STATUS.PENDING);

    if (newOrders.length === 0) {
      return;
    }

    for (const order of newOrders) {
      const data = {
        title: 'New order',
        message: `New order has been placed, amount: ${order.amounts.total}`,
        type: ENUM_NOTIFICATION_TYPE.NEW_ORDER,
        data: {
          orderId: order._id?.toString(),
          shipmentType: order.delivery?.type,
        },
      };

      const notification = await this.create(data);
      await this.pubSubPublisherService.publishMessage(new OrderPlacedEvent(notification));

      await this.notificationMethodService.notify(notification);
    }
  }

  async notifyOrderCommentAdded(comment: IComment): Promise<void> {
    const data = {
      title: 'New comment',
      message: `New comment has been added to an order: ${comment.note}`,
      type: ENUM_NOTIFICATION_TYPE.ORDER_COMMENT_ADDED,
      data: {
        comment,
      },
    };

    const notification = await this.create(data);
    await this.pubSubPublisherService.publishMessage(new OrderCommentAddedEvent(notification));

    await this.notificationMethodService.notify(notification);
  }

  async notifyDoorDashEvent(
    retailer: Types.ObjectId,
    orderId: Types.ObjectId,
    event: { label: string; date: string },
  ): Promise<void> {
    const data = {
      title: 'DoorDash Event',
      message: `${event.label} at ${event.date}`,
      type: ENUM_NOTIFICATION_TYPE.DOORDASH_EVENT,
      data: {
        orderId: orderId.toString(),
        event,
      },
    };

    const notification = await this.create(data);
    await this.pubSubPublisherService.publishMessage(new OrderDoorDashEvent(notification));

    await this.notificationMethodService.notify(notification);
  }
}
