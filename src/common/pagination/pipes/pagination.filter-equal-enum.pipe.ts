import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';
import { PaginationService } from '../services/pagination.service';

export function PaginationFilterEqualEnumPipe<T>(
  field: string,
  defaultValue: T,
  defaultEnum: Record<string, any>,
  raw: boolean,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInEnumPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(value: string): Promise<Record<string, T>> {
      const finalValue: T = value
        ? (defaultEnum[value.toUpperCase()] ?? defaultValue)
        : defaultValue;

      const res: Record<string, any> = raw
        ? {
            [field]: finalValue,
          }
        : this.paginationService.filterEqual<T>(field, finalValue);

      this.request.__pagination = {
        ...PAGINATION_DEFAULT,
        ...this.request.__pagination,
        filters: this.request.__pagination?.filters
          ? {
              ...this.request.__pagination.filters,
              ...res,
            }
          : res,
      };

      return res;
    }
  }

  return mixin(MixinPaginationFilterInEnumPipe);
}
