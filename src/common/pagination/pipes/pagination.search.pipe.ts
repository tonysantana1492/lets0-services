import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';

export function PaginationSearchPipe(availableSearch: string[]): Type<PipeTransform> {
  @Injectable()
  class MixinPaginationSearchPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(value: Record<string, any>): Promise<Record<string, any>> {
      const searchText = (this.request?.query?.search ?? '') as string;
      const filters = this.request?.body?.filters ?? {};

      this.request.__pagination = {
        ...PAGINATION_DEFAULT,
        ...this.request.__pagination,
        search: searchText,
        availableSearch,
      };

      return {
        ...value,
        ...this.request?.body,
        _searchText: searchText,
        _search: searchText,
        _availableSearch: availableSearch,
        _filters: filters,
      };
    }
  }

  return mixin(MixinPaginationSearchPipe);
}
