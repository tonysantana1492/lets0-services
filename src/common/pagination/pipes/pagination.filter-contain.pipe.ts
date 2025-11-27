import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import type { IPaginationFilterStringContainOptions } from '../interfaces/pagination.interface';
import { PAGINATION_DEFAULT } from '../constants/pagination.constant';
import { ENUM_PAGINATION_FILTER_CASE_OPTIONS } from '../constants/pagination.enum.constant';
import { PaginationService } from '../services/pagination.service';

export function PaginationFilterContainPipe(
  field: string,
  raw: boolean,
  options?: IPaginationFilterStringContainOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterContainPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(
      value: string,
    ): Promise<Record<string, { $regex: RegExp; $options: string } | string> | undefined> {
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

      let res: Record<string, any>;

      if (raw) {
        return {
          [field]: value,
        };
      } else if (options?.fullMatch) {
        res = this.paginationService.filterContainFullMatch(field, value);
      } else {
        res = this.paginationService.filterContain(field, value);
      }

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

  return mixin(MixinPaginationFilterContainPipe);
}
