import type { IRequestUserAgent } from './request-user-agent.interface';

export class IRequestMetadata {
  languages: string[];

  timestamp: number;

  timezone: string;

  requestId: string;

  path: string;

  version: string;

  repoVersion: string;

  method: string;

  xTimestamp?: number;

  ip?: string;

  userAgent: IRequestUserAgent;
}
