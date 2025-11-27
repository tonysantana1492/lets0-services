import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { Scope } from '@nestjs/common/interfaces';
import { REQUEST } from '@nestjs/core';

import { Types } from 'mongoose';

import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';

export function PaginationFilterEqualObjectIdPipe(
  field: string,
  raw: boolean,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinPaginationFilterEqualObjectIdPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
    ) {}

    async transform(value: string): Promise<Record<string, Types.ObjectId | string> | undefined> {
      if (!value) {
        return undefined;
      }

      value = value.trim();
      const finalValue = Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value;

      const res: Record<string, any> = raw
        ? {
            [field]: value,
          }
        : this.paginationService.filterEqual<Types.ObjectId | string>(field, finalValue);

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

  return mixin(MixinPaginationFilterEqualObjectIdPipe);
}
