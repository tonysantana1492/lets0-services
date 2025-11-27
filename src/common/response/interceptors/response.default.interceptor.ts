import type { CallHandler, ExecutionContext, HttpStatus, NestInterceptor } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import type { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import type { Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import { map } from 'rxjs/operators';

import {
  IMessage,
  IMessageOptionsProperties,
} from '@/common/language/interfaces/language.interface';
import { LanguageService } from '@/common/language/services/language.service';
import { getResponseMetadata } from '@/common/request/decorators/request.decorator';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import {
  IResponse,
  IResponseDefault,
  IResponseMetadataDefault,
} from '@/common/response/interfaces/response.interface';
import { ResponseDefaultSerialization } from '@/common/response/serializations/response.default.serialization';
import { I18nPath } from '@/languages/generated/i18n.generated';

import {
  RESPONSE_MESSAGE_PATH_META_KEY,
  RESPONSE_MESSAGE_PROPERTIES_META_KEY,
  RESPONSE_SERIALIZATION_META_KEY,
  RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
} from '../constants/response.constant';

@Injectable()
export class ResponseDefaultInterceptor<T> implements NestInterceptor<Promise<T>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly languageService: LanguageService,
  ) {}

  /**
   * Intercepts the execution of a handler method and performs additional logic.
   *
   * @param {ExecutionContext} context - The execution context of the method being intercepted.
   * @param {CallHandler} next - The next handler in the execution chain.
   * @returns {Promise<Observable<Promise<ResponseDefaultSerialization>>>} - A promise of an observable that emits a promise of the response serialization result.
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<ResponseDefaultSerialization>>> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map(async (res: Promise<Record<string, any>>) => {
          const _context: HttpArgumentsHost = context.switchToHttp();
          const response: IResponseDefault = _context.getResponse();
          const request = _context.getRequest<IRequestDefault>();

          const messagePath: string = this.reflector.get<string>(
            RESPONSE_MESSAGE_PATH_META_KEY,
            context.getHandler(),
          );
          const messageProperties: IMessageOptionsProperties =
            this.reflector.get<IMessageOptionsProperties>(
              RESPONSE_MESSAGE_PROPERTIES_META_KEY,
              context.getHandler(),
            );

          const language = request.language;
          const { message, classSerialization, classSerializationOptions } =
            this.getMetadata(context);
          const metadata = getResponseMetadata(request);
          const responseData = (await res) as IResponseDefault;

          if (responseData) {
            const data = responseData.data;
            const _metadata = responseData._metadata;

            const transformedData = this.transformData(
              data,
              classSerialization,
              classSerializationOptions,
            );
            const {
              statusCode,
              responseCode,
              message: responseMessage,
            } = this.getResponseProperties(_metadata, response, message);

            const messageSet: IMessage = this.languageService.get(
              (responseMessage ?? messagePath) as I18nPath,
              {
                customLanguages: language || [],
                properties: messageProperties,
              },
            );

            response.status(statusCode);

            return {
              responseCode: responseData?.responseCode ?? responseCode,
              message: messageSet,
              _metadata: { ...metadata, ..._metadata },
              data: { ...transformedData },
            };
          }

          return {
            responseCode: response.statusCode.toString(),
            message,
            _metadata: metadata,
          };
        }),
      );
    }

    return next.handle();
  }

  /**
   * Retrieves the metadata associated with the given execution context.
   *
   * @param {ExecutionContext} context - The execution context to retrieve metadata from.
   * @return {Object} - An object containing the metadata information.
   */
  private getMetadata(context: ExecutionContext): Record<string, any> {
    const message: string = this.reflector.get<string>(
      RESPONSE_MESSAGE_PATH_META_KEY,
      context.getHandler(),
    );
    const classSerialization: ClassConstructor<any> = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_SERIALIZATION_META_KEY,
      context.getHandler(),
    );
    const classSerializationOptions: ClassTransformOptions =
      this.reflector.get<ClassTransformOptions>(
        RESPONSE_SERIALIZATION_OPTIONS_META_KEY,
        context.getHandler(),
      );

    return { message, classSerialization, classSerializationOptions };
  }

  /**
   * Creates metadata for a given request.
   *
   * @param {IRequestDefault} request - The request object.
   * @return {ResponseMetadataSerialization} - The metadata object.
   */
  // private createMetadata(request): ResponseMetadataSerialization {
  //   return {
  //     languages: request.language,
  //     timestamp: request.__xTimestamp ?? request.__timestamp,
  //     timezone: request.__timezone,
  //     requestId: request.__id,
  //     path: request.path,
  //     version: request.__version,
  //     repoVersion: request.__repoVersion,
  //   };
  // }

  /**
   * Transforms data for serialization, handling Mongoose documents automatically.
   *
   * @param {Record<string, any> | undefined} data - The data to be transformed for serialization.
   * @param {ClassConstructor<any>} classSerialization - The class constructor to transform the data into.
   * @param {ClassTransformOptions} classSerializationOptions - The options to be used during the transformation.
   * @return {Record<string, any> | undefined} - The transformed data object or undefined if data is not provided.
   */
  private transformData(
    data: Record<string, any> | undefined,
    classSerialization: ClassConstructor<any>,
    classSerializationOptions: ClassTransformOptions,
  ): Record<string, any> | undefined {
    if (data && classSerialization) {
      const plainData = this.convertMongooseDocuments(data);

      return plainToInstance(classSerialization, plainData, {
        ...classSerializationOptions,
      });
    }

    return data;
  }

  /**
   * Recursively converts Mongoose documents to plain objects.
   *
   * @param data - The data that may contain Mongoose documents
   * @returns Plain JavaScript objects
   */
  private convertMongooseDocuments(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (data && typeof data.toObject === 'function') {
      return data.toObject();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertMongooseDocuments(item));
    }

    if (typeof data === 'object' && data.constructor === Object) {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.convertMongooseDocuments(value);
      }

      return result;
    }

    return data;
  }

  /**
   * Retrieves the response properties based on the provided parameters and the response object.
   *
   * @param _metadata - The metadata associated with the response.
   * @param response - The response object received from the API.
   * @param message - The default message for the response.
   * @returns An object containing the HTTP status, status code, and message.
   */
  private getResponseProperties(
    _metadata: IResponseMetadataDefault | undefined,
    response: IResponseDefault & IResponse,
    message: string,
  ): { statusCode: HttpStatus; responseCode: string; message: string } {
    let statusCode: HttpStatus = response.statusCode;
    let responseCode: string = response.statusCode.toString();
    let responseMessage: string = message;

    if (_metadata?.customProperty) {
      statusCode = _metadata.customProperty.statusCode ?? statusCode;
      responseCode = _metadata.customProperty.responseCode ?? responseCode;
      responseMessage = _metadata.customProperty.message ?? responseMessage;

      delete _metadata.customProperty;
    }

    return { statusCode, responseCode, message: responseMessage };
  }
}
