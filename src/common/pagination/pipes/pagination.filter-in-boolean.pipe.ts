import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { HelperArrayService } from '@/common/helpers/services/helper.array.service';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';

export function PaginationFilterInBooleanPipe(
  field: string,
  defaultValue: boolean[],
  raw: boolean,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
      private readonly helperArrayService: HelperArrayService,
    ) {}

    async transform(value: string): Promise<Record<string, { $in: boolean[] } | boolean[]>> {
      let finalValue: boolean[] = defaultValue;

      if (value) {
        finalValue = this.helperArrayService.unique(
          value.split(',').map((_value: string) => _value === 'true'),
        );
      }

      const res: Record<string, any> = raw
        ? {
            [field]: value,
          }
        : this.paginationService.filterIn<boolean>(field, finalValue);

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

  return mixin(MixinPaginationFilterInBooleanPipe);
}
