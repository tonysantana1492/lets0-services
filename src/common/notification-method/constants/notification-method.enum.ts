export enum ENUM_NOTIFICATION_METHOD_TYPE {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE_CALL = 'phone_call',
}
export enum ENUM_NOTIFICATION_EVENT_TYPE {
  ALL_ORDER = 'all_orders',
  ON_DEMAND = 'on_demand',
  SHIPPING = 'shipping',
}

export const NOTIFICATION_METHOD_DEFAULT_AVAILABLE_SEARCH = [
  'type',
  'status',
  'label',
  'contactInfo',
];

export const NOTIFICATION_METHOD_DEFAULT_AVAILABLE_ORDER_BY = [
  'type',
  'contactInfo',
  'eventType',
  'active',
  'createdAt',
];
