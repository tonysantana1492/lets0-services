import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from './pagination.enum.constant';

export const PAGINATION_PER_PAGE_DEFAULT = 100;
export const PAGINATION_MAX_PER_PAGE_DEFAULT = 150;
export const PAGINATION_PAGE_DEFAULT = 1;
export const PAGINATION_MAX_PAGE_DEFAULT = 20;
export const PAGINATION_ORDER_BY_DEFAULT = 'createdAt';
export const PAGINATION_ORDER_DIRECTION_DEFAULT: ENUM_PAGINATION_SORT_DIRECTION_TYPE =
  ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC;
export const PAGINATION_AVAILABLE_ORDER_BY_DEFAULT: string[] = ['createdAt'];
export const PAGINATION_AVAILABLE_ORDER_DIRECTION_DEFAULT: ENUM_PAGINATION_SORT_DIRECTION_TYPE[] =
  Object.values(ENUM_PAGINATION_SORT_DIRECTION_TYPE);

export const PAGINATION_DEFAULT = {
  availableOrderBy: [],
  availableOrderDirection: [],
  availableSearch: [],
  filters: undefined,
  orderBy: PAGINATION_ORDER_BY_DEFAULT,
  orderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC,
  search: '',
  statuses: { active: true, validated: true },
  page: PAGINATION_PAGE_DEFAULT,
  limit: PAGINATION_PER_PAGE_DEFAULT,
};
