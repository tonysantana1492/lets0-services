import type { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import type {
  IPaginationFilterDateOptions,
  IPaginationFilterStringContainOptions,
  IPaginationFilterStringEqualOptions,
} from '@/common/pagination/interfaces/pagination.interface';
import { Query } from '@nestjs/common';

import { PaginationFilterContainPipe } from '@/common/pagination/pipes/pagination.filter-contain.pipe';
import { PaginationFilterDatePipe } from '@/common/pagination/pipes/pagination.filter-date.pipe';
import { PaginationFilterEqualEnumPipe } from '@/common/pagination/pipes/pagination.filter-equal-enum.pipe';
import { PaginationFilterEqualObjectIdPipe } from '@/common/pagination/pipes/pagination.filter-equal-object-id.pipe';
import { PaginationFilterEqualPipe } from '@/common/pagination/pipes/pagination.filter-equal.pipe';
import { PaginationFilterInBooleanPipe } from '@/common/pagination/pipes/pagination.filter-in-boolean.pipe';
import { PaginationFilterInEnumPipe } from '@/common/pagination/pipes/pagination.filter-in-enum.pipe';
import { PaginationOrderPipe } from '@/common/pagination/pipes/pagination.order.pipe';
import { PaginationPagingPipe } from '@/common/pagination/pipes/pagination.paging.pipe';
import { PaginationSearchPipe } from '@/common/pagination/pipes/pagination.search.pipe';

import {
  PAGINATION_ORDER_BY_DEFAULT,
  PAGINATION_ORDER_DIRECTION_DEFAULT,
  PAGINATION_PER_PAGE_DEFAULT,
} from '../constants/pagination.constant';

export function PaginationQuery({
  defaultLimit = PAGINATION_PER_PAGE_DEFAULT,
  defaultOrderBy = PAGINATION_ORDER_BY_DEFAULT,
  defaultOrderDirection = PAGINATION_ORDER_DIRECTION_DEFAULT,
  availableSearch = [],
  availableOrderBy = [],
}: {
  defaultLimit?: number;
  defaultOrderBy?: string;
  defaultOrderDirection?: ENUM_PAGINATION_SORT_DIRECTION_TYPE;
  availableSearch?: string[];
  availableOrderBy?: string[];
}): ParameterDecorator {
  return Query(
    PaginationSearchPipe(availableSearch),
    PaginationPagingPipe(defaultLimit),
    PaginationOrderPipe(defaultOrderBy, defaultOrderDirection, availableOrderBy),
  );
}

export function PaginationQueryFilterInBoolean(
  field: string,
  defaultValue: boolean[],
  queryField?: string,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterInBooleanPipe(field, defaultValue, raw));
}

export function PaginationQueryFilterInEnum<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  queryField?: string,
  raw = false,
): ParameterDecorator {
  return Query(
    queryField ?? field,
    PaginationFilterInEnumPipe<T>(field, defaultValue, defaultEnum, raw),
  );
}

export function PaginationQueryFilterEqualEnum<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  queryField?: string,
  raw = false,
): ParameterDecorator {
  return Query(
    queryField ?? field,
    PaginationFilterEqualEnumPipe<T>(field, defaultValue, defaultEnum, raw),
  );
}

export function PaginationQueryFilterEqual(
  field: string,
  queryField?: string,
  options?: IPaginationFilterStringEqualOptions,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterEqualPipe(field, raw, options));
}

export function PaginationQueryFilterContain(
  field: string,
  queryField?: string,
  options?: IPaginationFilterStringContainOptions,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterContainPipe(field, raw, options));
}

export function PaginationQueryFilterDate(
  field: string,
  queryField?: string,
  options?: IPaginationFilterDateOptions,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterDatePipe(field, raw, options));
}

export function PaginationQueryFilterEqualObjectId(
  field: string,
  queryField?: string,
  raw = false,
): ParameterDecorator {
  return Query(queryField ?? field, PaginationFilterEqualObjectIdPipe(field, raw));
}
