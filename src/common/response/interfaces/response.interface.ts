import type { ENUM_HELPER_FILE_TYPE } from '@/common/helpers/constants/helper.enum.constant';
import type { IMessageOptionsProperties } from '@/common/language/interfaces/language.interface';
import type { HttpStatus } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import type { Response as ExpressResponse } from 'express';
import { OmitType } from '@nestjs/swagger';

import { IRequestMetadata } from '@/common/request/interfaces/request-metadata.interface';

export abstract class IResponseMetadataDefault extends OmitType(IRequestMetadata, [
  'userAgent',
  'method',
] as const) {
  customProperty?: IResponseCustomPropertyMetadata;
}

export interface IResponseCustomPropertyMetadata {
  responseCode?: string;
  message?: string;
  messageProperties?: IMessageOptionsProperties;
  statusCode?: HttpStatus;
}

export interface IResponseOptions<T> {
  serialization?: ClassConstructor<T>;
}

export interface IResponsePagingOptions<T> extends Omit<IResponseOptions<T>, 'serialization'> {
  serialization: ClassConstructor<T>;
}

export interface IResponseFileOptions<T> extends IResponseOptions<T> {
  fileType?: ENUM_HELPER_FILE_TYPE;
}

export interface IResponse {
  _metadata?: IResponseMetadataDefault;
  data?: Record<string, any>;
}

export interface IResponseDefault<T = Record<string, any>> extends ExpressResponse {
  responseCode?: string;
  message?: string;
  _metadata?: IResponseMetadataDefault;
  data?: T;
}

export interface IResponsePagingPagination {
  totalPage: number;
  total: number;
  limit?: number;
  offset?: number;
}

export interface IResponsePaging {
  authToken?: string;
  _metadata?: IResponseMetadataDefault;
  _pagination: IResponsePagingPagination;
  data: any;
}

// export interface IResponseFile {
//   data: IHelperFileRows[];
// }
