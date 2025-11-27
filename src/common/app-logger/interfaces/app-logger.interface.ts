import type { IRequestUserAgent } from '@/common/request/interfaces/request-user-agent.interface';

export interface ILogDetails {
  requestId: string;
  message: string;
  context?: string;
  stack?: string;
  statusCode?: number;
  responseCode?: string;
  ip?: string;
  path?: string;
  userAgent?: IRequestUserAgent;
  method?: string;
  timestamp?: number;
  appErrors?: Array<Record<string, any>>;
  durationMs: string;
}
