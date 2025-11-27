import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { ValidationError } from 'class-validator';

import {
  IErrorBadRequestException,
  IErrorException,
  IErrors,
} from '@/common/error/interfaces/error.interface';
import { HelperTokenService } from '@/common/helpers/services/helper.token.service';
import { LanguageService } from '@/common/language/services/language.service';
import {
  getRequestMetadata,
  getResponseMetadata,
  setResponseHeaders,
} from '@/common/request/decorators/request.decorator';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';
import { IResponseDefault } from '@/common/response/interfaces/response.interface';
import { ResponseMetadataSerialization } from '@/common/response/serializations/response.default-metadata.serialization';
import { I18nPath } from '@/languages/generated/i18n.generated';

@Catch(HttpException)
export class ResponseExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly languageService: LanguageService,
    private readonly helperTokenService: HelperTokenService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<IResponseDefault>();

    const request = ctx.getRequest<IRequestDefault>();

    const metadata = getRequestMetadata(request);

    const responseException = exception.getResponse() as IErrorException | string;
    const statusCode = exception.getStatus() as HttpStatus;

    const {
      messagePath,
      exceptionError = '',
      responseCode = '',
      messageProperties = { message: '' },
      data,
      appErrors = [],
    } = typeof responseException === 'object'
      ? this.processCustomErrorException(responseException, metadata) // Is CustomError
      : { messagePath: responseException }; // Is Normal Error

    const translatedMessage = this.languageService.get(messagePath as I18nPath, {
      customLanguages: metadata.languages,
      properties: messageProperties,
    });

    request.__exception = {
      responseCode,
      appErrors,
      message: translatedMessage,
      exception,
    };

    setResponseHeaders(response, metadata);
    const responseMetadata = getResponseMetadata(request);

    if (statusCode === HttpStatus.SERVICE_UNAVAILABLE) {
      const cookies = this.helperTokenService.getCookiesForLogOut();

      response.setHeader('Set-Cookie', cookies);
    }

    response.status(statusCode).json({
      responseCode,
      message: translatedMessage,
      errors: appErrors,
      _error: exceptionError,
      _metadata: responseMetadata,
      data,
    });
  }

  private processCustomErrorException(
    responseException: Record<string, any>,
    metadata: ResponseMetadataSerialization,
  ): IErrorBadRequestException {
    const { _metadata } = responseException;
    const responseCode = responseException.responseCode;
    const messagePath = responseException.message;
    const data = responseException.data;
    const messageProperties = _metadata?.customProperty?.messageProperties ?? { message: '' };
    delete _metadata?.customProperty;

    metadata = {
      ...metadata,
      ..._metadata,
    };

    let appErrors: IErrors[] = [];

    // This errors can be from class-validator or from try/catch errors
    if (responseException.errors && responseException?.errors?.length > 0) {
      appErrors = this.languageService.getDtoClassErrorsMessage(
        responseException.errors as ValidationError[],
      );
    }

    const exceptionError =
      responseException._error && typeof responseException._error === 'string'
        ? responseException._error
        : JSON.stringify(responseException._error);

    return {
      responseCode,
      messagePath,
      data,
      messageProperties,
      exceptionError,
      appErrors,
      metadata,
    };
  }
}
