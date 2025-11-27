import type { IDatabaseFindAllOptions } from '@/common/database/interfaces/database.interface';
import type { PaginationListDto } from '@/common/pagination/dtos/pagination.list.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { Types } from 'mongoose';

import { EmailService } from '@/common/email/email.service';
import { HelperDateService } from '@/common/helpers/services/helper.date.service';
import { ENUM_NOTIFICATION_TYPE } from '@/common/notification/constants/notification.enum';
import { NotificationDoc } from '@/common/notification/repository/entities/notification.entity';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { TwilioService } from '@/common/twilio/twilio.service';

import type { INotificationMethod } from '../interfaces/notification-method.interface';
import type { NotificationMethodDoc } from '../repository/entities/notification-method.entity';
import { ENUM_DELIVERY_TYPES } from '../constants/delivery-type.enum';
import {
  ENUM_NOTIFICATION_EVENT_TYPE,
  ENUM_NOTIFICATION_METHOD_TYPE,
} from '../constants/notification-method.enum';
import { IRetailerStoreHours } from '../interfaces/retailer.interface';
import { NotificationMethodEntity } from '../repository/entities/notification-method.entity';
import { NotificationMethodModel } from '../repository/models/notification-method.model';

@Injectable()
export class NotificationMethodService {
  private readonly logger: Logger = new Logger(NotificationMethodService.name);

  constructor(
    private readonly notificationMethodRepo: NotificationMethodModel,
    private readonly paginationService: PaginationService,
    private readonly helperDateService: HelperDateService,
    private readonly twilioService: TwilioService,
    private readonly gmailService: EmailService,
  ) {}

  async findAll(
    find: Partial<NotificationMethodEntity>,
    options?: IDatabaseFindAllOptions,
  ): Promise<NotificationMethodEntity[]> {
    const t = await this.notificationMethodRepo.findAll(find, options);

    return t;
  }

  async create(data: Partial<INotificationMethod>): Promise<NotificationMethodDoc> {
    const notificationMethod = new NotificationMethodEntity(data);

    return this.notificationMethodRepo.create(notificationMethod);
  }

  async findOneOrThrow(id: string): Promise<NotificationMethodDoc> {
    const notificationMethod = await this.notificationMethodRepo.findOne({
      _id: new Types.ObjectId(id),
    });

    if (!notificationMethod) {
      throw new NotFoundException('Notification method not found');
    }

    return notificationMethod;
  }

  async getPaginated(retailer: string, pagination: PaginationListDto) {
    const find: Record<string, any> = {
      search: pagination._search,
      retailer,
    };
    const total = await this.notificationMethodRepo.getTotal(find);
    const totalPage = this.paginationService.totalPageWithoutMax(total, pagination._limit);

    const result = await this.notificationMethodRepo.findAll(find, {
      paging: {
        limit: pagination._limit,
        offset: pagination._offset,
      },
      // order: pagination._order,
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

  async updateOneOrThrow(
    id: string,
    data: Partial<INotificationMethod>,
  ): Promise<NotificationMethodDoc> {
    const notificationMethod = await this.findOneOrThrow(id);

    notificationMethod.active = data.active ?? notificationMethod.active;
    notificationMethod.label = data.label ?? notificationMethod.label;
    notificationMethod.contactInfo = data.contactInfo ?? notificationMethod.contactInfo;
    notificationMethod.updatedAt = new Date();

    return this.notificationMethodRepo.save(notificationMethod);
  }

  async deleteOneOrThrow(id: string) {
    return await this.notificationMethodRepo.deleteOneById(id);
  }

  async notify(notification: NotificationDoc) {
    const activeNotificationMethods = await this.notificationMethodRepo.findAll(
      {
        active: true,
      },
      { join: { path: 'retailer' } },
    );

    for (const method of activeNotificationMethods) {
      this.sendNotification(method, notification);
    }
  }

  private sendNotification(method: NotificationMethodEntity, notification: NotificationDoc) {
    const { type, eventType } = method;

    if (this.isWithinBusinessHours(method) && this.matchEventType(notification, eventType)) {
      switch (type) {
        case ENUM_NOTIFICATION_METHOD_TYPE.EMAIL: {
          this.sendEmail(method, notification);
          break;
        }

        case ENUM_NOTIFICATION_METHOD_TYPE.SMS: {
          this.sendSms(method, notification);
          break;
        }

        case ENUM_NOTIFICATION_METHOD_TYPE.PHONE_CALL: {
          this.sendPhoneCall(method, notification);
          break;
        }

        default: {
          this.logger.error(`Unknown notification method type: ${type}`);
        }
      }
    }
  }

  private isWithinBusinessHours(method: NotificationMethodEntity) {
    if (!method.businessHoursOnly) {
      return true;
    }

    try {
      const storeHours: IRetailerStoreHours[] = [
        {
          active: true,
          wday: 5,
          startsAt: '8:00',
          endsAt: ' 17:00',
        },
      ];

      const timezone = 'America/New_York';

      const weekDay = new Date().getDay();

      const storeHoursToday = storeHours?.find((storeHour) => storeHour.wday === weekDay);

      if (!storeHoursToday) {
        return false;
      }

      const { startsAt, endsAt } = storeHoursToday;
      const now = new Date();
      const startsAtDate = this.helperDateService.parseWithTimeZone(
        startsAt,
        'h:mm a',
        new Date(),
        timezone ?? 'UTC',
      );
      const endsAtDate = this.helperDateService.parseWithTimeZone(
        endsAt,
        'h:mm a',
        new Date(),
        timezone ?? 'UTC',
      );

      return now >= startsAtDate && now <= endsAtDate;
    } catch (error) {
      console.info(error);

      return false;
    }
  }

  private matchEventType(notification: NotificationDoc, eventType: ENUM_NOTIFICATION_EVENT_TYPE) {
    if (notification.type !== ENUM_NOTIFICATION_TYPE.NEW_ORDER) {
      return false;
    }

    const notificationData = notification.data as { shipmentType?: ENUM_DELIVERY_TYPES };

    switch (eventType) {
      case ENUM_NOTIFICATION_EVENT_TYPE.ALL_ORDER: {
        return true;
      }

      case ENUM_NOTIFICATION_EVENT_TYPE.ON_DEMAND: {
        return notificationData.shipmentType === ENUM_DELIVERY_TYPES.ON_DEMAND;
      }

      case ENUM_NOTIFICATION_EVENT_TYPE.SHIPPING: {
        return notificationData.shipmentType === ENUM_DELIVERY_TYPES.SHIPPING;
      }

      default: {
        return false;
      }
    }
  }

  private sendEmail(method: NotificationMethodEntity, notification: NotificationDoc) {
    void this.gmailService.sendMail({
      to: method.contactInfo,
      subject: notification.title,
      text: notification.message,
    });
  }

  private sendSms(method: NotificationMethodEntity, notification: NotificationDoc) {
    void this.twilioService.sendSms(method.contactInfo, notification.message);
  }

  private sendPhoneCall(method: NotificationMethodEntity, notification: NotificationDoc) {
    void this.twilioService.sendCall(method.contactInfo, notification.message);
  }
}
