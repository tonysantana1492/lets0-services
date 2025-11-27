import type { ENUM_NOTIFICATION_TYPE } from '../constants/notification.enum';

export interface INotification {
  type: ENUM_NOTIFICATION_TYPE;
  isRead: boolean;
  title: string;
  message: string;
  data: Record<string, any>;
}
