import { BaseEvent } from '@/common/google/pubsub/interface/base.event';

import type { NotificationDoc } from '../../repository/entities/notification.entity';
import { NOTIFICATIONS_TOPIC_NAME } from '../../constants/notification.enum';

export class OrderDoorDashEvent extends BaseEvent {
  constructor(payload: NotificationDoc) {
    super();
    this.topicName = NOTIFICATIONS_TOPIC_NAME;
    this.type = 'doordash-event'; // @TODO: add type to ENUM_NOTIFICATION_TYPE
    this.payload = payload;
  }
}
