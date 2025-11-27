import { Injectable } from '@nestjs/common';

import {
  PAGINATION_AVAILABLE_ORDER_BY_DEFAULT,
  PAGINATION_ORDER_BY_DEFAULT,
  PAGINATION_ORDER_DIRECTION_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
  PAGINATION_PER_PAGE_DEFAULT,
} from '@/common/pagination/constants/pagination.constant';
import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';

@Injectable()
export class PaginationService {
  offset(page: number, perPage: number): number {
    return (page - 1) * perPage;
  }

  totalPage(totalData: number, perPage: number): number {
    let totalPage = Math.ceil(totalData / perPage);
    totalPage = totalPage === 0 ? 1 : totalPage;

    return totalPage;
  }

  offsetWithoutMax(page: number, perPage: number): number {
    return (page - 1) * perPage;
  }

  totalPageWithoutMax(totalData: number, perPage: number): number {
    let totalPage = Math.ceil(totalData / perPage);
    totalPage = totalPage === 0 ? 1 : totalPage;

    return totalPage;
  }

  page(page?: number): number {
    return page ?? PAGINATION_PAGE_DEFAULT;
  }

  limit(limit?: number): number {
    return limit ?? PAGINATION_PER_PAGE_DEFAULT;
  }

  order(
    orderByValue = PAGINATION_ORDER_BY_DEFAULT,
    orderDirectionValue = PAGINATION_ORDER_DIRECTION_DEFAULT,
    availableOrderBy = PAGINATION_AVAILABLE_ORDER_BY_DEFAULT,
  ): Record<string, any> {
    const orderBy: string = availableOrderBy.includes(orderByValue)
      ? orderByValue
      : PAGINATION_ORDER_BY_DEFAULT;

    return { [orderBy]: orderDirectionValue === ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC ? 1 : -1 };
  }

  search(availableSearch: string[], searchValue = ''): Record<string, any> | undefined {
    if (!searchValue) {
      return undefined;
    }

    return {
      $or: availableSearch.map((value) => ({
        [value]: {
          $regex: new RegExp(searchValue),
          $options: 'i',
        },
      })),
    };
  }

  mongoInitialQuery(
    filters?: any,
    statuses?: { active: boolean; validated: boolean },
  ): Record<string, any> {
    let query: Record<string, any> = {};
    const filterQuery: Record<string, any> = this.getFilterQuery(filters);

    if (statuses && Object.entries(statuses).length > 0) {
      query = this.getStatusQuery(statuses);
    }

    if (filterQuery && Object.entries(filterQuery).length > 0) {
      query = {
        ...query,
        ...filterQuery,
      };
    }

    return query;
  }

  getFilterQuery(filters?: any): Record<string, any> {
    const filterKeys: Array<keyof any> = ['brand', 'category', 'classification', 'catPath'];
    const filterKeysObject: Record<string, any> = {};

    if (filters) {
      for (const key of filterKeys) {
        if (key in filters && filters[key].length > 0 && typeof key === 'string') {
          filterKeysObject[key] = { $in: filters[key] };
        }
      }
    }

    return filterKeysObject;
  }

  getStatusQuery(statuses: { active: boolean; validated: boolean }): Record<string, any> {
    const statusKeys: Array<keyof typeof statuses> = ['active', 'validated'];
    const statusObject: Record<string, any> = {};

    for (const key of statusKeys) {
      if (key in statuses) {
        statusObject[key] = statuses[key];
      }
    }

    return statusObject;
  }

  filterEqual<T = string>(field: string, filterValue: T): Record<string, T> {
    return { [field]: filterValue };
  }

  filterContain(
    field: string,
    filterValue: string,
  ): Record<string, { $regex: RegExp; $options: string }> {
    return {
      [field]: {
        $regex: new RegExp(filterValue),
        $options: 'i',
      },
    };
  }

  filterContainFullMatch(
    field: string,
    filterValue: string,
  ): Record<string, { $regex: RegExp; $options: string }> {
    return {
      [field]: {
        $regex: new RegExp(`\\b${filterValue}\\b`),
        $options: 'i',
      },
    };
  }

  filterIn<T = string>(field: string, filterValue: T[]): Record<string, { $in: T[] }> {
    return {
      [field]: {
        $in: filterValue,
      },
    };
  }

  filterDate(field: string, filterValue: Date): Record<string, Date> {
    return {
      [field]: filterValue,
    };
  }
}
