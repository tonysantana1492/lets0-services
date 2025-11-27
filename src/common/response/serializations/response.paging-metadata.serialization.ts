import type { IResponsePagingPagination } from '@/common/response/interfaces/response.interface';
import type {
  ResponsePaginationCursorSerialization,
  ResponsePaginationSerialization,
} from '@/common/response/serializations/response.paging.cursor.serialization';

import { ResponseMetadataSerialization } from '@/common/response/serializations/response.default-metadata.serialization';

export class ResponsePagingMetadataSerialization extends ResponseMetadataSerialization {
  cursor?: ResponsePaginationCursorSerialization;

  _pagination?: IResponsePagingPagination;

  pagination?: ResponsePaginationSerialization;
}
