import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import type { IPaginationFilterDateOptions } from '../interfaces/pagination.interface';
import { HelperDateService } from '../../helpers/services/helper.date.service';
import { PAGINATION_DEFAULT } from '../constants/pagination.constant';
import { ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS } from '../constants/pagination.enum.constant';
import { PaginationService } from '../services/pagination.service';

export function PaginationFilterDatePipe(
  field: string,
  raw: boolean,
  options?: IPaginationFilterDateOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterDatePipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
      private readonly helperDateService: HelperDateService,
    ) {}

    async transform(value: string): Promise<Record<string, Date | string> | undefined> {
      if (!value) {
        return undefined;
      }

      let finalValue: Date = this.helperDateService.create(value);

      if (options?.time === ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS.END_OF_DAY) {
        finalValue = this.helperDateService.endOfDay(finalValue);
      } else if (options?.time === ENUM_PAGINATION_FILTER_DATE_TIME_OPTIONS.START_OF_DAY) {
        finalValue = this.helperDateService.startOfDay(finalValue);
      }

      const res: Record<string, any> = raw
        ? {
            [field]: finalValue,
          }
        : this.paginationService.filterDate(field, finalValue);

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

  return mixin(MixinPaginationFilterDatePipe);
}
