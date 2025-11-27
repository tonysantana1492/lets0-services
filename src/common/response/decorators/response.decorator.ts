import type {
  IResponseOptions,
  IResponsePagingOptions,
} from '@/common/response/interfaces/response.interface';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

import { DocResponse, DocResponsePaging } from '@/common/doc/decorators/doc.decorator';
import { ResponseDefaultSerialization } from '@/common/response/serializations/response.default.serialization';

import {
  RESPONSE_MESSAGE_PATH_META_KEY,
  RESPONSE_SERIALIZATION_META_KEY,
} from '../constants/response.constant';
import { ResponsePagingInterceptor } from '../interceptors/paging/response.paging.interceptor';
import { ResponseDefaultInterceptor } from '../interceptors/response.default.interceptor';

/**
 * Decorator that applies interceptors and sets metadata for a response method.
 *
 * @template T - The type of the response data.
 * @param {string} messagePath - The path to the message.
 * @param {IResponseOptions<T>} options - The response options.
 * @returns {MethodDecorator} - The decorated method.
 *
 * @param {string} messagePath - The path to the message.
 * @param {IResponseOptions<T>} options - The response options.
 * @returns {MethodDecorator} - The decorated method.
 */
export function ResponseHttp<T>(
  messagePath?: string,
  options: IResponseOptions<T> = {},
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponseDefaultInterceptor<T>),
    DocResponse(messagePath, options),
    SetMetadata(RESPONSE_MESSAGE_PATH_META_KEY, messagePath ?? ''),
    SetMetadata(
      RESPONSE_SERIALIZATION_META_KEY,
      options.serialization ?? ResponseDefaultSerialization,
    ),
  );
}

/**
 * Decorator that applies paging response interceptor to a method.
 *
 * @param {string} messagePath - The path to the message in the response body.
 * @param {IResponsePagingOptions<T>} [options] - Optional paging options.
 * @returns {MethodDecorator} - The decorated method.
 */
export function ResponseHttpPaging<T>(
  messagePath?: string,
  options?: IResponsePagingOptions<T>,
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor<T>),
    DocResponsePaging(messagePath, options),
    SetMetadata(RESPONSE_MESSAGE_PATH_META_KEY, messagePath ?? ''),
    SetMetadata(RESPONSE_SERIALIZATION_META_KEY, options?.serialization),
  );
}

export { SerializeOptions as ResponseSerializationOptions } from '@nestjs/common';
