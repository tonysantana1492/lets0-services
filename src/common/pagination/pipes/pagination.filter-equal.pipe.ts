import type { IPaginationFilterStringEqualOptions } from '@/common/pagination/interfaces/pagination.interface';
import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { HelperNumberService } from '@/common/helpers/services/helper.number.service';
import { ENUM_PAGINATION_FILTER_CASE_OPTIONS } from '@/common/pagination/constants/pagination.enum.constant';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';

export function PaginationFilterEqualPipe(
  field: string,
  raw: boolean,
  options?: IPaginationFilterStringEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterEqualPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
      private readonly helperNumberService: HelperNumberService,
    ) {}

    async transform(value: string): Promise<Record<string, string | number> | undefined> {
      if (!value) {
        return undefined;
      }

      if (options?.case === ENUM_PAGINATION_FILTER_CASE_OPTIONS.UPPERCASE) {
        value = value.toUpperCase();
      } else if (options?.case === ENUM_PAGINATION_FILTER_CASE_OPTIONS.LOWERCASE) {
        value = value.toUpperCase();
      }

      if (options?.trim) {
        value = value.trim();
      }

      let finalValue: string | number = value;

      if (options?.isNumber) {
        finalValue = this.helperNumberService.check(value)
          ? this.helperNumberService.createNumber(value)
          : value;
      }

      const res: Record<string, any> = raw
        ? {
            [field]: value,
          }
        : this.paginationService.filterEqual<string | number>(field, finalValue);

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

  return mixin(MixinPaginationFilterEqualPipe);
}
