import type { IErrors } from '@/common/error/interfaces/error.interface';
import type { IRequestUserAgent } from '@/common/request/interfaces/request-user-agent.interface';
import type { RequestPaginationSerialization } from '@/common/request/serializations/request.pagination.serialization';
import type { UserDoc } from '@/common/user/repository/entities/user.entity';
import type { HttpException } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

export interface IStatuses {
  active: boolean;

  validated: boolean;
}

export interface IRequestException {
  responseCode: string;
  appErrors: IErrors[];
  message: string;
  exception: HttpException;
}

export interface IRequestDefault<T = any> extends ExpressRequest {
  apiToken?: string;

  authToken?: string;

  twoFAToken?: string;

  user?: Partial<UserDoc>;

  customData?: T;

  __id: string;

  __xTimestamp?: number;

  __timestamp: number;

  __timezone: string;

  language: string[];

  __version: string;

  __lqd__: string;

  __repoVersion: string;

  __userAgent: IRequestUserAgent;

  __class?: string;

  __function?: string;

  __pagination?: RequestPaginationSerialization;

  __ip: string;

  __exception: IRequestException;

  __startTime: any;
}
