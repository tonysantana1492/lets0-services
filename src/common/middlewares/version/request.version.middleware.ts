import type { NestMiddleware } from '@nestjs/common';
import type { Response as ExpressResponse, NextFunction } from 'express';
import { Injectable } from '@nestjs/common';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { IRequestDefault } from '@/common/request/interfaces/request.interface';

@Injectable()
export class RequestVersionMiddleware implements NestMiddleware {
  constructor(private readonly configService: AppConfigService) {}

  async use(
    request: IRequestDefault,
    response: ExpressResponse,
    next: NextFunction,
  ): Promise<void> {
    const originalUrl: string = request.originalUrl;
    let version = this.configService.appConfig.versioning.version;

    if (
      this.configService.appConfig.versioning.isEnabled &&
      originalUrl.startsWith(
        `${this.configService.appConfig.globalPrefix}/${this.configService.appConfig.versioning.prefix}`,
      )
    ) {
      const url: string[] = originalUrl.split('/');
      version = url[2].replaceAll(this.configService.appConfig.versioning.prefix, '');
    }

    request.__version = version;
    request.__repoVersion = this.configService.appConfig.repoVersion;

    next();
  }
}
