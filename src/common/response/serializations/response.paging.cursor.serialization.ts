import { RequestPaginationSerialization } from '@/common/request/serializations/request.pagination.serialization';

export class ResponsePaginationCursorSerialization {
  nextPage: string;

  previousPage: string;

  firstPage: string;

  lastPage: string;
}

export class ResponsePaginationSerialization extends RequestPaginationSerialization {
  total: number;

  totalPage: number;

  userAttribution?: string;
}
