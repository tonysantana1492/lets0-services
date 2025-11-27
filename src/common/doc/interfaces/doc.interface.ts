import type { ENUM_DOC_REQUEST_BODY_TYPE } from '@/common/doc/constants/doc.enum.constant';
import type { HttpStatus } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';

export interface IDocumentOptions {
  summary?: string;
  operation?: string;
  deprecated?: boolean;
  description?: string;
}

export interface IDocumentOfOptions {
  responseCode: string;
  messagePath: string;
  serialization?: ClassConstructor<any>;
}

export interface IDocumentDefaultOptions extends IDocumentOfOptions {
  statusCode: HttpStatus;
}

export interface IDocumentAuthOptions {
  accessToken?: boolean;
  jwtRefreshToken?: boolean;
  apiKey?: boolean;
  google?: boolean;
}

export interface IDocumentRequestOptions {
  params?: ClassConstructor<any>;
  queries?: ClassConstructor<any>; //ApiQueryOptions[];
  bodyType?: ENUM_DOC_REQUEST_BODY_TYPE;
  body?: ClassConstructor<any>;
}

export type IDocRequestFileOptions = Omit<IDocumentRequestOptions, 'bodyType'>;

export interface IDocumentGuardOptions {
  userAgent?: boolean;
  timestamp?: boolean;
  role?: boolean;
  policy?: boolean;
}

export interface IDocumentResponseOptions<T> {
  responseCode?: string;
  statusCode?: HttpStatus;
  serialization?: ClassConstructor<T>;
}

export interface IDocumentResponsePagingOptions<T>
  extends Omit<IDocumentResponseOptions<T>, 'serialization'> {
  serialization: ClassConstructor<T>;
}

export interface IDocumentErrorOptions<T> {
  messagePath: string;
  options?: IDocumentResponseOptions<T>;
}
