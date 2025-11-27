import { Injectable } from '@nestjs/common';

import { ClsService } from 'nestjs-cls';

import { ERROR_CODES } from '@/common/error/constants/error-code';
import { AppRequestException } from '@/common/error/exceptions/app-request.exception';
import { IRequestMetadata } from '@/common/request/interfaces/request-metadata.interface';

@Injectable()
export default class ContextService {
  constructor(private readonly cls: ClsService) {}

  public get<T>(key: string): T | undefined {
    return this.cls.get(key);
  }

  public set<T>(key: string, value: T): void {
    this.cls.set(key, value);
  }

  public setRequestMetadata(metadata: IRequestMetadata): void {
    this.cls.set('REQUEST_METADATA', metadata);
  }

  public getRequestMetadata(): IRequestMetadata {
    const requestMetadata = this.cls.get('REQUEST_METADATA');

    // You need to use the @RequestInjectMetadataContext decorator in your controller
    if (!requestMetadata) throw new AppRequestException(ERROR_CODES.REQUEST_METADATA_NOT_FOUND);

    return requestMetadata;
  }
}
