import type {
  ENUM_PAGINATION_FILTER_CASE_OPTIONS,
  ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS,
  ENUM_PAGINATION_SORT_DIRECTION_TYPE,
} from '../constants/pagination.enum.constant';

export type IPaginationSort = Record<string, ENUM_PAGINATION_SORT_DIRECTION_TYPE>;

export interface IPaginationPaging {
  limit: number;
  offset: number;
}

export interface IPaginationOptions {
  paging?: IPaginationPaging;
  order?: IPaginationSort;
}

export interface IPaginationFilterDateOptions {
  time?: ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS;
}

export interface IPaginationFilterStringContainOptions {
  case?: ENUM_PAGINATION_FILTER_CASE_OPTIONS;
  trim?: boolean;
  fullMatch?: boolean;
}

export interface IPaginationFilterStringEqualOptions extends IPaginationFilterStringContainOptions {
  isNumber?: boolean;
}
