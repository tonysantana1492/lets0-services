import type { CanActivate, ExecutionContext, ValidationError } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { IRequestWithUser } from '@/common/auth/interfaces/request-with-user.interface';
import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';

import { ValidateAccountIdDto } from '../dtos/validate-gmail-account-id.dto';
import { GmailAccountService } from '../gmail-account.service';

@Injectable()
export class ValidateAccount implements CanActivate {
  constructor(
    private readonly gmailAccountService: GmailAccountService,
    // private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest<IRequestWithUser>();

    // const classDtos: ClassConstructor<any> = this.reflector.get<ClassConstructor<any>>(
    //   CATALOG_SEARCH_VALUE_META_KEY,
    //   context.getHandler(),
    // );

    const request = plainToInstance(ValidateAccountIdDto, params);

    const errors: ValidationError[] = await validate(request);

    if (errors.length > 0) {
      throw new AppRequestException({ ...ERROR_CODES.GMAIL_INVALID_ACCOUNT, errors });
    }

    return await this.gmailAccountService.validateAccount({
      userId: user.id,
      accountId: params.accountId,
    });
  }
}
