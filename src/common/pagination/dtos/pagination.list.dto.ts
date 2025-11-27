import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import type { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '../constants/pagination.enum.constant';

export class PaginationListDto {
  @ApiProperty({ type: String, required: false, default: '' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiHideProperty()
  _search: string;

  @ApiHideProperty()
  _limit: number;

  // @ApiHideProperty()
  // _active: boolean;

  @ApiHideProperty()
  _page: number;

  @ApiHideProperty()
  _offset: number;

  @ApiHideProperty()
  _availableOrderBy: string[];

  @ApiHideProperty()
  _availableOrderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE[];
}
