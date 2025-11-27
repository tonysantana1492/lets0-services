import type {
  IDocRequestFileOptions,
  IDocumentAuthOptions,
  IDocumentDefaultOptions,
  IDocumentGuardOptions,
  IDocumentOfOptions,
  IDocumentOptions,
  IDocumentRequestOptions,
  IDocumentResponseOptions,
  IDocumentResponsePagingOptions,
} from '@/common/doc/interfaces/doc.interface';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiHeaders,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  getSchemaPath,
} from '@nestjs/swagger';

import { faker } from '@faker-js/faker';

import { APP_LANGUAGE } from '@/common/app-config/constants/app.constant';
import { ENUM_DOC_REQUEST_BODY_TYPE } from '@/common/doc/constants/doc.enum.constant';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { ENUM_PAGINATION_SORT_DIRECTION_TYPE } from '@/common/pagination/constants/pagination.enum.constant';
import { ResponseDefaultSerialization } from '@/common/response/serializations/response.default.serialization';
import { ResponsePagingSerialization } from '@/common/response/serializations/response.paging.serialization';

import { DefaultDocSerialization } from '../serializations/default-doc.serialization';

type ApiDocType = (
  target: Record<string, any>,
  key?: string | symbol,
  descriptor?: TypedPropertyDescriptor<any>,
) => any;

export function DocDefault<T>(options: IDocumentDefaultOptions): MethodDecorator {
  const docs: ApiDocType[] = [];
  const schema: Record<string, any> = {
    allOf: [{ $ref: getSchemaPath(ResponseDefaultSerialization<T>) }],
    properties: {
      message: {
        example: options.messagePath,
      },
      responseCode: {
        type: 'number',
        example: options.responseCode,
      },
    },
  };

  if (options.serialization) {
    docs.push(ApiExtraModels(options.serialization));
    schema.properties = {
      ...schema.properties,
      data: {
        $ref: getSchemaPath(options.serialization),
      },
    };
  }

  return applyDecorators(
    ApiExtraModels(ResponseDefaultSerialization<T>),
    ApiResponse({
      status: options.statusCode,
      schema,
    }),
    ...docs,
  );
}

export function DocOneOf<T>(
  statusCode: HttpStatus,
  ...documents: IDocumentOfOptions[]
): MethodDecorator {
  const docs: ApiDocType[] = [];
  const oneOf: Array<Record<string, any>> = [];

  for (const document of documents) {
    const oneOfSchema: Record<string, any> = {
      allOf: [{ $ref: getSchemaPath(ResponseDefaultSerialization<T>) }],
      properties: {
        message: {
          example: document.messagePath,
        },
        responseCode: {
          type: 'number',
          example: document.responseCode ?? HttpStatus.OK,
        },
      },
    };

    if (document.serialization) {
      docs.push(ApiExtraModels(document.serialization));
      oneOfSchema.properties = {
        ...oneOfSchema.properties,
        data: {
          $ref: getSchemaPath(document.serialization),
        },
      };
    }

    oneOf.push(oneOfSchema);
  }

  return applyDecorators(
    ApiExtraModels(ResponseDefaultSerialization<T>),
    ApiResponse({
      status: statusCode,
      schema: {
        oneOf,
      },
    }),
    ...docs,
  );
}

export function DocAnyOf<T>(
  statusCode: HttpStatus,
  ...documents: IDocumentOfOptions[]
): MethodDecorator {
  const docs: ApiDocType[] = [];
  const anyOf: Array<Record<string, any>> = [];

  for (const document of documents) {
    const anyOfSchema: Record<string, any> = {
      allOf: [{ $ref: getSchemaPath(ResponseDefaultSerialization<T>) }],
      properties: {
        message: {
          example: document.messagePath,
        },
        responseCode: {
          type: 'string',
          example: document.responseCode ?? HttpStatus.OK.toString(),
        },
      },
    };

    if (document.serialization) {
      docs.push(ApiExtraModels(document.serialization));
      anyOfSchema.properties = {
        ...anyOfSchema.properties,
        data: {
          $ref: getSchemaPath(document.serialization),
        },
      };
    }

    anyOf.push(anyOfSchema);
  }

  return applyDecorators(
    ApiExtraModels(ResponseDefaultSerialization<T>),
    ApiResponse({
      status: statusCode,
      schema: {
        anyOf,
      },
    }),
    ...docs,
  );
}

export function DocAllOf<T>(
  statusCode: HttpStatus,
  ...documents: IDocumentOfOptions[]
): MethodDecorator {
  const docs: ApiDocType[] = [];
  const allOf: Array<Record<string, any>> = [];

  for (const document of documents) {
    const allOfSchema: Record<string, any> = {
      allOf: [{ $ref: getSchemaPath(ResponseDefaultSerialization<T>) }],
      properties: {
        message: {
          example: document.messagePath,
        },
        responseCode: {
          type: 'string',
          example: document.responseCode.toString() ?? HttpStatus.OK.toString(),
        },
      },
    };

    if (document.serialization) {
      docs.push(ApiExtraModels(document.serialization));
      allOfSchema.properties = {
        ...allOfSchema.properties,
        data: {
          $ref: getSchemaPath(document.serialization),
        },
      };
    }

    allOf.push(allOfSchema);
  }

  return applyDecorators(
    ApiExtraModels(ResponseDefaultSerialization<T>),
    ApiResponse({
      status: statusCode,
      schema: {
        allOf,
      },
    }),
    ...docs,
  );
}

export function Doc(options?: IDocumentOptions): MethodDecorator {
  const currentTimestamp: number = Date.now();
  const userAgent: string = faker.internet.userAgent();

  return applyDecorators(
    ApiOperation({
      summary: options?.summary,
      deprecated: options?.deprecated,
      description: options?.description,
      operationId: options?.operation,
    }),
    ApiHeaders([
      {
        name: 'user-agent',
        description: 'User agent header',
        required: false,
        schema: {
          default: userAgent,
          example: userAgent,
          type: 'string',
        },
      },
      {
        name: 'x-custom-lang',
        description: 'Custom language header',
        required: false,
        schema: {
          default: APP_LANGUAGE,
          example: APP_LANGUAGE,
          type: 'string',
        },
      },
      {
        name: 'x-timestamp',
        description: 'Timestamp header, in microseconds',
        required: false,
        schema: {
          default: currentTimestamp,
          example: currentTimestamp,
          type: 'number',
        },
      },
    ]),
    // SERVICE_UNAVAILABLE
    DocDefault({
      statusCode: ERROR_CODES.HTTP_SERVICE_UNAVAILABLE.statusCode,
      messagePath: ERROR_CODES.HTTP_SERVICE_UNAVAILABLE.message,
      responseCode: ERROR_CODES.HTTP_SERVICE_UNAVAILABLE.responseCode,
    }),

    DocDefault({
      statusCode: ERROR_CODES.HTTP_SERVICE_INTERNAL_SERVER_ERROR.statusCode,
      messagePath: ERROR_CODES.HTTP_SERVICE_INTERNAL_SERVER_ERROR.message,
      responseCode: ERROR_CODES.HTTP_SERVICE_INTERNAL_SERVER_ERROR.responseCode,
    }),
    DocDefault({
      statusCode: ERROR_CODES.HTTP_SERVICE_UNAUTHORIZED.statusCode,
      messagePath: ERROR_CODES.HTTP_SERVICE_UNAUTHORIZED.message,
      responseCode: ERROR_CODES.HTTP_SERVICE_UNAUTHORIZED.responseCode,
    }),
    DocDefault({
      statusCode: ERROR_CODES.HTTP_REQUEST_TIME_OUT.statusCode,
      messagePath: ERROR_CODES.HTTP_REQUEST_TIME_OUT.message,
      responseCode: ERROR_CODES.HTTP_REQUEST_TIME_OUT.responseCode,
    }),
  );
}

export function DocRequest(options?: IDocumentRequestOptions) {
  const docs: Array<ClassDecorator | MethodDecorator> = [];

  switch (options?.bodyType) {
    case ENUM_DOC_REQUEST_BODY_TYPE.FORM_DATA: {
      docs.push(ApiConsumes('multipart/form-data'));

      break;
    }

    case ENUM_DOC_REQUEST_BODY_TYPE.TEXT: {
      docs.push(ApiConsumes('text/plain'));

      break;
    }

    case ENUM_DOC_REQUEST_BODY_TYPE.JSON: {
      docs.push(ApiConsumes('application/json'));

      break;
    }
    // No default
  }

  if (options?.bodyType) {
    docs.push(
      DocDefault({
        statusCode: ERROR_CODES.REQUEST_VALIDATION_PARAMS.statusCode,
        messagePath: ERROR_CODES.REQUEST_VALIDATION_PARAMS.message,
        responseCode: ERROR_CODES.REQUEST_VALIDATION_PARAMS.responseCode,
      }),
    );
  }

  if (options?.params) {
    docs.push(ApiParam({ name: 'param', type: options.params }));
  }

  if (options?.queries) {
    docs.push(ApiQuery({ type: options.queries }));
  }

  if (options?.body) {
    docs.push(ApiBody({ type: options.body }));
  }

  return applyDecorators(...docs);
}

export function DocRequestFile(options?: IDocRequestFileOptions) {
  const docs: Array<ClassDecorator | MethodDecorator> = [];

  if (options?.params) {
    const parameter = ApiParam(options.params);
    docs.push(parameter);
  }

  if (options?.queries) {
    docs.push(ApiQuery({ type: options.queries }));
  }

  if (options?.body) {
    docs.push(ApiBody({ type: options.body }));
  }

  return applyDecorators(ApiConsumes('multipart/form-data'), ...docs);
}

export function DocGuard(options?: IDocumentGuardOptions) {
  const oneOfForbidden: IDocumentOfOptions[] = [];

  if (options?.userAgent) {
    oneOfForbidden.push(
      {
        responseCode: ERROR_CODES.USER_AGENT_OS_INVALID.responseCode,
        messagePath: ERROR_CODES.USER_AGENT_OS_INVALID.message,
      },
      {
        responseCode: ERROR_CODES.USER_AGENT_BROWSER_INVALID.responseCode,
        messagePath: ERROR_CODES.USER_AGENT_BROWSER_INVALID.message,
      },
      {
        responseCode: ERROR_CODES.USER_AGENT_BROWSER_INVALID.responseCode,
        messagePath: ERROR_CODES.USER_AGENT_BROWSER_INVALID.message,
      },
    );
  }

  if (options?.timestamp) {
    oneOfForbidden.push({
      responseCode: ERROR_CODES.TIME_STAMP_INVALID.responseCode,
      messagePath: ERROR_CODES.TIME_STAMP_INVALID.message,
    });
  }

  return applyDecorators(DocOneOf(HttpStatus.FORBIDDEN, ...oneOfForbidden));
}

export function DocAuth(options?: IDocumentAuthOptions) {
  const docs: Array<ClassDecorator | MethodDecorator> = [];
  const oneOfUnauthorized: IDocumentOfOptions[] = [];

  if (options?.apiKey) {
    docs.push(ApiSecurity('apiKey'));
    oneOfUnauthorized.push(
      {
        responseCode: ERROR_CODES.API_KEY_NEEDED_ERROR.responseCode,
        messagePath: ERROR_CODES.API_KEY_NEEDED_ERROR.message,
      },
      {
        responseCode: ERROR_CODES.API_KEY_NOT_FOUND_ERROR.responseCode,
        messagePath: ERROR_CODES.API_KEY_NOT_FOUND_ERROR.message,
      },
      {
        responseCode: ERROR_CODES.API_KEY_NOT_ACTIVE_YET_ERROR.responseCode,
        messagePath: ERROR_CODES.API_KEY_NOT_ACTIVE_YET_ERROR.message,
      },
      {
        responseCode: ERROR_CODES.API_KEY_EXPIRED_ERROR.responseCode,
        messagePath: ERROR_CODES.API_KEY_EXPIRED_ERROR.message,
      },
      {
        responseCode: ERROR_CODES.API_KEY_INVALID_ERROR.responseCode,
        messagePath: ERROR_CODES.API_KEY_INVALID_ERROR.message,
      },
    );
  }

  if (options?.accessToken) {
    docs.push(ApiBearerAuth('accessToken'));
    oneOfUnauthorized.push({
      responseCode: ERROR_CODES.ACCESS_TOKEN_INVALID.responseCode,
      messagePath: ERROR_CODES.ACCESS_TOKEN_INVALID.message,
    });
  }

  return applyDecorators(...docs, DocOneOf(HttpStatus.UNAUTHORIZED, ...oneOfUnauthorized));
}

export function DocResponse<T = void>(
  messagePath?: string,
  options?: IDocumentResponseOptions<T>,
): MethodDecorator {
  const docs: IDocumentDefaultOptions = {
    statusCode: options?.statusCode ?? HttpStatus.OK,
    messagePath: messagePath ?? '',
    responseCode: options?.responseCode ?? '000000',
  };

  if (options?.serialization) {
    docs.serialization = options.serialization;
  }

  return applyDecorators(
    ApiProduces('application/json'),
    ApiExtraModels(options?.serialization ?? DefaultDocSerialization),
    ApiResponse({
      status: docs.statusCode,
      schema: {
        allOf: [{ $ref: getSchemaPath(ResponseDefaultSerialization<T>) }],
        properties: {
          message: {
            example: messagePath,
          },
          responseCode: {
            type: 'string',
            example: docs.responseCode,
          },
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(options?.serialization ?? DefaultDocSerialization),
            },
          },
        },
      },
    }),
  );
}

export function DocErrorGroup(docs: MethodDecorator[]) {
  return applyDecorators(...docs);
}

export function DocResponsePaging<T = void>(
  messagePath?: string,
  options?: IDocumentResponsePagingOptions<T>,
): MethodDecorator {
  const docs: IDocumentDefaultOptions = {
    statusCode: options?.statusCode ?? HttpStatus.OK,
    messagePath: messagePath ?? '',
    responseCode: options?.responseCode ?? '000000',
  };

  return applyDecorators(
    ApiProduces('application/json'),
    ApiQuery({
      name: 'limit',
      required: false,
      allowEmptyValue: true,
      example: 100,
      type: 'number',
      description: 'Data per page',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      allowEmptyValue: true,
      example: 1,
      type: 'number',
      description: 'page number',
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      allowEmptyValue: true,
      example: 'createdAt',
      type: 'string',
      description: 'Order by base on _metadata.pagination.availableOrderBy',
    }),
    ApiQuery({
      name: 'orderDirection',
      required: false,
      allowEmptyValue: true,
      example: ENUM_PAGINATION_SORT_DIRECTION_TYPE.ASC,
      enum: ENUM_PAGINATION_SORT_DIRECTION_TYPE,
      type: 'string',
      description: 'Order direction base on _metadata.pagination.availableOrderDirection',
    }),
    ApiExtraModels(ResponsePagingSerialization<T>),
    ApiExtraModels(options?.serialization ?? DefaultDocSerialization),
    ApiResponse({
      status: docs.statusCode,
      schema: {
        allOf: [{ $ref: getSchemaPath(ResponsePagingSerialization<T>) }],
        properties: {
          message: {
            example: messagePath,
          },
          responseCode: {
            type: 'number',
            example: docs.responseCode,
          },
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(options?.serialization ?? DefaultDocSerialization),
            },
          },
        },
      },
    }),
  );
}
