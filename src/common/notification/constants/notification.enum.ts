export enum ENUM_NOTIFICATION_TYPE {
  ORDER_STATUS_CHANGE = 'order-status-change',
  ORDER_COMMENT_ADDED = 'order-comment-added',
  DOORDASH_EVENT = 'doordash-event',
  NEW_ORDER = 'new-order',
}

export const NOTIFICATION_DEFAULT_AVAILABLE_SEARCH = ['type'];

export const NOTIFICATION_DEFAULT_AVAILABLE_ORDER_BY = ['createdAt'];

export const NOTIFICATIONS_TOPIC_NAME = 'sidulink-services-notifications';
