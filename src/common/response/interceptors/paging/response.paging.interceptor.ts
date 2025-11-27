import type {
  IMessage,
  IMessageOptionsProperties,
} from '@/common/language/interfaces/language.interface';
import type { ResponsePaginationCursorSerialization } from '@/common/response/serializations/response.paging.cursor.serialization';
import type { CallHandler, ExecutionContext, HttpStatus, NestInterceptor } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import qs from 'qs';
import { map } from 'rxjs/operators';

import { HelperArrayService } from '@/common/helpers/services/helper.array.service';
import { LanguageService } from '@/common/language/services/language.service';
import { getResponseMetadata } from '@/common/request/decorators/request.decorator';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import {
  RESPONSE_MESSAGE_PATH_META_KEY,
  RESPONSE_MESSAGE_PROPERTIES_META_KEY,
  RESPONSE_SERIALIZATION_META_KEY,
  RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
} from '@/common/response/constants/response.constant';
import { IResponseDefault, IResponsePaging } from '@/common/response/interfaces/response.interface';
import { ResponsePagingMetadataSerialization } from '@/common/response/serializations/response.paging-metadata.serialization';
import { ResponsePagingSerialization } from '@/common/response/serializations/response.paging.serialization';
import { I18nPath } from '@/languages/generated/i18n.generated';

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor<Promise<T>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly languageService: LanguageService,
    private readonly helperArrayService: HelperArrayService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<ResponsePagingSerialization>>> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map(async (res: Promise<IResponsePaging>) => {
          const ctx: HttpArgumentsHost = context.switchToHttp();
          const response: IResponseDefault = ctx.getResponse();
          const request: IRequestDefault = ctx.getRequest<IRequestDefault>();

          let messagePath: string = this.reflector.get<string>(
            RESPONSE_MESSAGE_PATH_META_KEY,
            context.getHandler(),
          );
          const classSerialization: ClassConstructor<any> = this.reflector.get<
            ClassConstructor<any>
          >(RESPONSE_SERIALIZATION_META_KEY, context.getHandler());
          const classSerializationOptions: ClassTransformOptions =
            this.reflector.get<ClassTransformOptions>(
              RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
              context.getHandler(),
            );
          let messageProperties: IMessageOptionsProperties =
            this.reflector.get<IMessageOptionsProperties>(
              RESPONSE_MESSAGE_PROPERTIES_META_KEY,
              context.getHandler(),
            );

          // metadata
          let metadata: ResponsePagingMetadataSerialization;

          const baseMetadata = getResponseMetadata(request);
          metadata = { ...baseMetadata, ip: baseMetadata.ip ?? '' };

          const __pagination = request.__pagination;

          if (!__pagination) {
            throw new Error('Paging must have __pagination');
          }

          let statusCode: HttpStatus = response.statusCode;
          let responseCode: string = response.statusCode.toString();
          let data: Array<Record<string, any>> = [];

          // response
          const responseData = await res;

          if (!responseData) {
            throw new Error('Paging must have response');
          }

          const { _metadata } = responseData;
          data = responseData.data;

          if (classSerialization) {
            data = plainToInstance(classSerialization, data, classSerializationOptions);
          }

          statusCode = _metadata?.customProperty?.statusCode ?? statusCode;
          responseCode = _metadata?.customProperty?.responseCode ?? responseCode;
          messagePath = _metadata?.customProperty?.message ?? messagePath;
          messageProperties = _metadata?.customProperty?.messageProperties ?? messageProperties;

          delete _metadata?.customProperty;

          const { query } = request;

          delete query.perPage;

          delete query.page;

          const { _pagination } = responseData;

          const totalPage = _pagination?.totalPage ?? 0;
          const total = _pagination?.total ?? 0;

          const perPage = 10;
          const page = 0;

          const queryString = qs.stringify(query, {
            encode: false,
          });

          const cursorPaginationMetadata: ResponsePaginationCursorSerialization = {
            nextPage:
              page < totalPage
                ? (() => {
                    if (queryString) {
                      return `${metadata.path}?perPage=${perPage}&page=${page + 1}&${queryString}`;
                    }

                    return `${metadata.path}?perPage=${perPage}&page=${page + 1}`;
                  })()
                : '',
            previousPage:
              page > 1
                ? (() => {
                    if (queryString) {
                      return `${metadata.path}?perPage=${perPage}&page=${page - 1}&${queryString}`;
                    }

                    return `${metadata.path}?perPage=${perPage}&page=${page - 1}`;
                  })()
                : '0',
            firstPage:
              totalPage > 1
                ? (() => {
                    if (queryString) {
                      return `${metadata.path}?perPage=${perPage}&page=${1}&${queryString}`;
                    }

                    return `${metadata.path}?perPage=${perPage}&page=${1}`;
                  })()
                : '0',
            lastPage:
              totalPage > 1
                ? (() => {
                    if (queryString) {
                      return `${metadata.path}?perPage=${perPage}&page=${totalPage}&${queryString}`;
                    }

                    return `${metadata.path}?perPage=${perPage}&page=${totalPage}`;
                  })()
                : '0',
          };

          metadata = {
            ...metadata,
            ..._metadata,
            pagination: {
              ...__pagination,
              ...metadata._pagination,
              total,
              totalPage, //data.length > 0 ? totalPage : 0,
            },
          };

          if (!this.helperArrayService.notIn(Object.values(cursorPaginationMetadata))) {
            metadata.cursor = cursorPaginationMetadata;
          }

          const message: IMessage = await this.languageService.get(messagePath as I18nPath, {
            customLanguages: request.language || [],
            properties: messageProperties,
          });

          response.status(statusCode);

          return {
            responseCode,
            message,
            _metadata: metadata,
            data,
          };
        }),
      );
    }

    return next.handle();
  }
}
