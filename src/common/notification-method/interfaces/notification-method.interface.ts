import type {
  ENUM_NOTIFICATION_EVENT_TYPE,
  ENUM_NOTIFICATION_METHOD_TYPE,
} from '../constants/notification-method.enum';

export interface INotificationMethod {
  type: ENUM_NOTIFICATION_METHOD_TYPE;
  eventType: ENUM_NOTIFICATION_EVENT_TYPE;
  active: boolean;
  label: string;
  contactInfo: string;
  businessHoursOnly: boolean;
}
