import { BaseEvent } from '@/common/google/pubsub/interface/base.event';

import type { NotificationDoc } from '../../repository/entities/notification.entity';

export class OrderPlacedEvent extends BaseEvent {
  constructor(payload: NotificationDoc) {
    super();
    this.topicName = 'projects/production-378210/topics/retailer-services-notifications';
    this.type = 'order-placed';
    this.payload = payload;
  }
}
