import type { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import {
  PAGINATION_AVAILABLE_ORDER_DIRECTION_DEFAULT,
  PAGINATION_DEFAULT,
} from '@/common/pagination/constants/pagination.constant';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

export function PaginationOrderPipe(
  defaultOrderBy: string,
  defaultOrderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE,
  availableOrderBy: string[],
): Type<PipeTransform> {
  @Injectable()
  class MixinPaginationOrderPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(value: Record<string, any>): Promise<Record<string, any>> {
      const orderBy: string = this.request?.body?.orderBy ?? defaultOrderBy;
      const orderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE =
        this.request?.body?.orderDirection ?? defaultOrderDirection;
      const availableOrderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE[] =
        PAGINATION_AVAILABLE_ORDER_DIRECTION_DEFAULT;

      const order: Record<string, any> = this.paginationService.order(
        orderBy,
        orderDirection,
        availableOrderBy,
      );

      this.request.__pagination = {
        ...PAGINATION_DEFAULT,
        ...this.request.__pagination,
        orderBy,
        orderDirection,
        availableOrderBy,
        availableOrderDirection,
      };

      return {
        ...value,
        ...this.request?.body,
        _order: order,
        _availableOrderBy: availableOrderBy,
        _availableOrderDirection: availableOrderDirection,
      };
    }
  }

  return mixin(MixinPaginationOrderPipe);
}
