import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

import { REQUEST_PARAM_CLASS_DTOS_META_KEY } from '../constants/request.constant';

@Injectable()
export class RequestParamRawGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { params } = context.switchToHttp().getRequest<IRequestDefault>();
    const classDtos: Array<ClassConstructor<any>> = this.reflector.get<
      Array<ClassConstructor<any>>
    >(REQUEST_PARAM_CLASS_DTOS_META_KEY, context.getHandler());

    for (const clsDto of classDtos) {
      const request = plainToInstance(clsDto, params);

      const errors: ValidationError[] = await validate(request as ClassConstructor<any>);

      if (errors.length > 0) {
        throw new AppRequestException({
          ...ERROR_CODES.HTTP_BAD_REQUEST,
          errors,
        });
      }
    }

    return true;
  }
}
