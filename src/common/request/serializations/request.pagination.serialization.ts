import { ApiProperty } from '@nestjs/swagger';

import { faker } from '@faker-js/faker';

import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';

export class RequestPaginationSerialization {
  @ApiProperty({
    required: true,
    nullable: false,
    example: faker.person.fullName(),
  })
  search: string;

  // @ApiProperty({
  //   required: true,
  //   nullable: false,
  //   example: true,
  // })
  // active: boolean;

  @ApiProperty({
    required: true,
    nullable: false,
    example: {},
  })
  filters: Record<string, string | number | boolean | Array<string | number | boolean>> | undefined;

  @ApiProperty({
    required: true,
    nullable: false,
    example: 1,
  })
  page: number;

  @ApiProperty({
    required: true,
    nullable: false,
    example: 20,
  })
  limit: number;

  @ApiProperty({
    required: true,
    nullable: false,
    example: 'createdAt',
  })
  orderBy: string;

  @ApiProperty({
    required: true,
    nullable: false,
    example: ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC,
  })
  orderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE;

  @ApiProperty({
    required: true,
    nullable: false,
    example: ['name'],
  })
  availableSearch: string[];

  @ApiProperty({
    required: true,
    nullable: false,
    example: ['name', 'createdAt'],
  })
  availableOrderBy: string[];

  @ApiProperty({
    required: true,
    nullable: false,
    example: Object.values(ENUM_PAGINATION_SORT_DIRECTION_TYPE),
  })
  availableOrderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE[];
}
