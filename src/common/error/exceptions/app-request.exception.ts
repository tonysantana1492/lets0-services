import type { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

export class AppRequestException extends HttpException {
  public readonly responseCode: string;

  constructor({
    responseCode,
    message,
    statusCode,
    errors,
  }: {
    responseCode: string;
    message: string;
    statusCode: HttpStatus;
    errors?: any;
  }) {
    super({ responseCode, message, errors, statusCode }, statusCode);

    // This field can read inside a try/catch like error.responseCode
    this.responseCode = responseCode;
  }
}

export const CUSTOM_HTTP_EXCEPTION_NAME = AppRequestException.name;
