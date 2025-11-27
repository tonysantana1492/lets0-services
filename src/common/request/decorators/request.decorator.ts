import type { IRequestDefault } from '@/common/request/interfaces/request.interface';
import type {
  IResponseDefault,
  IResponseMetadataDefault,
} from '@/common/response/interfaces/response.interface';
import type { ResponseMetadataSerialization } from '@/common/response/serializations/response.default-metadata.serialization';
import type { ExecutionContext } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import {
  applyDecorators,
  createParamDecorator,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { RequestMetadataContextInterceptor } from '@/common/request/interceptors/request.metadata-context.interceptor';

import type { IRequestMetadata } from '../interfaces/request-metadata.interface';
import {
  REQUEST_CUSTOM_TIMEOUT_META_KEY,
  REQUEST_CUSTOM_TIMEOUT_VALUE_META_KEY,
  REQUEST_PARAM_CLASS_DTOS_META_KEY,
} from '../constants/request.constant';
import { RequestParamRawGuard } from '../guards/request.param.guard';
import { RequestTimestampInterceptor } from '../interceptors/request.timestamp.interceptor';
import { RequestUserAgentInterceptor } from '../interceptors/request.user-agent.interceptor';

export function getRequestMetadata(request: IRequestDefault): IRequestMetadata {
  return {
    languages: request.language || [],
    timestamp: request.__timestamp,
    timezone: request.__timezone,
    requestId: request.__id,
    path: request.path,
    version: request.__version,
    repoVersion: request.__repoVersion,
    method: request.method,
    ip: request.ip,
    userAgent: request.__userAgent,
  };
}

export function getResponseMetadata(request: IRequestDefault): IResponseMetadataDefault {
  return {
    languages: request.language || [],
    timestamp: request.__timestamp,
    timezone: request.__timezone,
    requestId: request.__id,
    path: request.path,
    version: request.__version,
    repoVersion: request.__repoVersion,
    ip: request.ip,
  };
}

export function setResponseHeaders(
  response: IResponseDefault,
  metadata: ResponseMetadataSerialization,
): void {
  response
    .setHeader('x-timestamp', metadata.timestamp ?? 0)
    .setHeader('x-timezone', metadata.timezone ?? '')
    .setHeader('x-request-id', metadata.requestId ?? 0)
    .setHeader('x-version', metadata.version ?? 0)
    .setHeader('x-repo-version', metadata.repoVersion ?? 0);
}

export function RequestInjectMetadataContext(): MethodDecorator {
  return applyDecorators(UseInterceptors(RequestMetadataContextInterceptor));
}

/**
 * A decorator function to extract the user agent from the request object.
 * @returns {ParameterDecorator} The decorator function.
 */
export const RequestMetadata: () => ParameterDecorator = createParamDecorator(
  (data: string, context: ExecutionContext): IRequestMetadata => {
    const request = context.switchToHttp().getRequest<IRequestDefault>();

    const metadata = getRequestMetadata(request);
    return metadata;
  },
);

export function RequestParamGuard(
  ...classValidation: Array<ClassConstructor<any>>
): MethodDecorator {
  return applyDecorators(
    UseGuards(RequestParamRawGuard),
    SetMetadata(REQUEST_PARAM_CLASS_DTOS_META_KEY, classValidation),
  );
}

/**
 * Method decorator to validate the user agent in a request.
 * This decorator applies the RequestUserAgentInterceptor interceptor to the method.
 *
 * @return {MethodDecorator} The decorated method.
 */
export function RequestValidateUserAgent(): MethodDecorator {
  return applyDecorators(UseInterceptors(RequestUserAgentInterceptor));
}

/**
 * RequestValidateTimestamp Method Decorator
 *
 * This method decorator applies the `RequestTimestampInterceptor` interceptor to validate the timestamp of the request.
 * The interceptor checks if the request timestamp is valid and rejects the request if it's deemed invalid.
 *
 * @return The decorated method with `RequestTimestampInterceptor` interceptor applied.
 */
export function RequestValidateTimestamp(): MethodDecorator {
  return applyDecorators(UseInterceptors(RequestTimestampInterceptor));
}

/**
 * Sets a custom timeout for a request.
 * @param {string} seconds - The timeout duration in seconds.
 * @return {MethodDecorator} - The decorator to set the custom timeout for a request.
 */
export function RequestTimeout(seconds: string): MethodDecorator {
  return applyDecorators(
    SetMetadata(REQUEST_CUSTOM_TIMEOUT_META_KEY, true),
    SetMetadata(REQUEST_CUSTOM_TIMEOUT_VALUE_META_KEY, seconds),
  );
}
