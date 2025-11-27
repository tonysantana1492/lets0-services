import type { Type } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common/interfaces';
import { Inject, Injectable, mixin } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { HelperNumberService } from '@/common/helpers/services/helper.number.service';
import { PaginationService } from '@/common/pagination/services/pagination.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { PAGINATION_DEFAULT } from '../constants/pagination.constant';

export function PaginationPagingPipe(defaultLimit: number): Type<PipeTransform> {
  @Injectable()
  class MixinPaginationPagingPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestDefault,
      private readonly paginationService: PaginationService,
      private readonly helperNumberService: HelperNumberService,
    ) {}

    async transform(value: Record<string, any>): Promise<Record<string, any>> {
      const query = this.request?.query as { page: string; limit: string };

      const page: number = this.paginationService.page(
        this.helperNumberService.createNumber(query?.page ?? 1),
      );
      const limit: number = this.paginationService.limit(
        this.helperNumberService.createNumber(query.limit ?? defaultLimit),
      );

      this.request.__pagination = {
        ...PAGINATION_DEFAULT,
        ...this.request.__pagination,
        page,
        limit,
      };

      return {
        ...value,
        _page: page,
        _limit: limit,
      };
    }
  }

  return mixin(MixinPaginationPagingPipe);
}
