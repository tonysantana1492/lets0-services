import { PickType } from '@nestjs/swagger';

import { NotificationMethodEntity } from '../repository/entities/notification-method.entity';

export class CreateNotificationMethodDto extends PickType(NotificationMethodEntity, [
  'type',
  'eventType',
  'active',
  'businessHoursOnly',
  'contactInfo',
  'label',
] as const) {}
