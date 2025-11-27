import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

export class DatabaseErrorException extends AppRequestException {
  constructor() {
    super({
      responseCode: ERROR_CODES.DATABASE_ERROR.responseCode,
      message: ERROR_CODES.DATABASE_ERROR.message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
