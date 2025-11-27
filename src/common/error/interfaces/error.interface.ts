import type { IMessageOptionsProperties } from '@/common/language/interfaces/language.interface';
import type { ResponseMetadataSerialization } from '@/common/response/serializations/response.default-metadata.serialization';
import type { HttpStatus } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

import type { IResponseCustomPropertyMetadata } from '../../response/interfaces/response.interface';

// error default
export interface IErrors {
  readonly message: string;

  readonly property: string;
}

// error import
export interface IErrorsImport {
  row: number;

  file?: string;

  sheet?: number;

  errors: IErrors[];
}

export interface IValidationErrorImport extends Omit<IErrorsImport, 'errors'> {
  errors: ValidationError[];
}

// error exception

export type IErrorCustomPropertyMetadata = Pick<
  IResponseCustomPropertyMetadata,
  'messageProperties'
>;

export interface IErrorMetadata {
  customProperty?: IErrorCustomPropertyMetadata;

  // [key: string]: any;
}

export interface IErrorCodes {
  responseCode: string;
  message: string;
  statusCode: HttpStatus;
}

export interface IErrorException {
  responseCode: number;

  message: string;

  errors?: ValidationError[] | IValidationErrorImport[];

  data?: Record<string, any>;

  _error?: string;

  // _errorType?: ERROR_TYPE;

  _metadata?: IErrorMetadata;
}

export interface IErrorBadRequestException {
  responseCode: string;

  messagePath: string;

  data: Record<string, any> | undefined;

  messageProperties: IMessageOptionsProperties;

  exceptionError: string;

  appErrors: IErrors[];

  metadata: ResponseMetadataSerialization;
}

export interface IErrorHttpFilter extends Omit<IErrorException, '_errorType' | 'message'> {
  message: string;
}
