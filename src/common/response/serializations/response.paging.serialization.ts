import { ApiProperty, PickType } from '@nestjs/swagger';

import { PAGINATION_AVAILABLE_ORDER_DIRECTION_DEFAULT } from '@/common/pagination/constants/pagination.constant';
import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import { ResponseDefaultSerialization } from '@/common/response/serializations/response.default.serialization';
import { ResponsePagingMetadataSerialization } from '@/common/response/serializations/response.paging-metadata.serialization';

export class ResponsePagingSerialization<T = Record<string, any>> extends PickType(
  ResponseDefaultSerialization,
  ['responseCode', 'message'] as const,
) {
  @ApiProperty({
    name: '_metadata',
    required: true,
    nullable: false,
    description: 'Contain metadata about API',
    type: Object,
    example: {
      languages: ['en'],
      timestamp: 1_660_190_937_231,
      timezone: 'America/New_York',
      requestId: '40c2f734-7247-472b-bc26-8eff6e669781',
      path: '/api/v1/test/hello',
      version: '1',
      repoVersion: '1.0.0',
      pagination: {
        search: '',
        page: null,
        perPage: null,
        // nextPageToken: faker.string.alphanumeric(80),
        orderBy: 'createdAt',
        orderDirection: ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC,
        availableSearch: [],
        availableOrderBy: ['createdAt'],
        availableOrderDirection: PAGINATION_AVAILABLE_ORDER_DIRECTION_DEFAULT,
        total: null,
        totalPage: null,
      },
      // cursor: {
      //   nextPage: `http://217.0.0.1/__path?perPage=10&page=3&search=abc`,
      //   previousPage: `http://217.0.0.1/__path?perPage=10&page=1&search=abc`,
      //   firstPage: `http://217.0.0.1/__path?perPage=10&page=1&search=abc`,
      //   lastPage: `http://217.0.0.1/__path?perPage=10&page=20&search=abc`,
      // },
    },
  })
  readonly _metadata: ResponsePagingMetadataSerialization;

  readonly data: T[];
}
