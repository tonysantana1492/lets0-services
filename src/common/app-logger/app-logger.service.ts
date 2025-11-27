import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';

import { AppConfigService } from '@/common/app-config/app-config.service';
import { ENUM_APP_ENVIRONMENT } from '@/common/app-config/enums/app.enum';
import { getLogLevels } from '@/common/app-logger/constants/get-log-levels';
import { ILogDetails } from '@/common/app-logger/interfaces/app-logger.interface';

import { LogsService } from './app-persist-logger.service';

@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
  private readonly logsService: LogsService;

  private static contextsToIgnore = new Set([
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'NestApplication',
    'I18nService',
  ]);

  constructor(
    context: string,
    options: ConsoleLoggerOptions,
    appConfigService: AppConfigService,
    logsService: LogsService,
  ) {
    const { env } = appConfigService.appConfig;

    super(context, {
      ...options,
      logLevels: getLogLevels(env === ENUM_APP_ENVIRONMENT.PRODUCTION),
      timestamp: true,
    });

    this.logsService = logsService;
  }

  log(message: string, context?: string, ...optionalParams) {
    const { details } = this.getLogData(optionalParams);

    if (this.shouldIgnoreContext(context)) return;

    this.logToConsole('log', { ...details, message, context });
    void this.persistLog('log', { ...details, message, context });
  }

  error(message: string, context?: string, stack?: string, ...optionalParams) {
    const { details } = this.getLogData(optionalParams);

    this.logToConsole('error', { ...details, message, context, stack });
    void this.persistLog('error', { ...details, message, context, stack });
  }

  warn(message: string, context?: string, stack?: string, ...optionalParams) {
    const { details } = this.getLogData(optionalParams);

    this.logToConsole('warn', { ...details, message, context, stack });
    void this.persistLog('warn', { ...details, message, context });
  }

  debug(message: string, context?: string) {
    if (this.shouldIgnoreContext(context)) return;

    super.debug(message, context);
  }

  verbose(message: string, context?: string) {
    if (this.shouldIgnoreContext(context)) return;

    super.verbose(message, context);
  }

  private getLogData(optionalParams) {
    return {
      details: optionalParams[0] ? optionalParams[0] : {},
    };
  }

  private shouldIgnoreContext(context?: string): boolean {
    if (!context) return true;

    if (AppLoggerService.contextsToIgnore.has(context)) return true;

    return false;
  }

  private logToConsole(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    details: ILogDetails,
  ) {
    const {
      message,
      context,
      stack,
      method,
      path,
      responseCode,
      durationMs,
      statusCode,
      appErrors,
    } = details;

    const logMessage = `${method ?? ''} ${statusCode ?? ''} ${path ?? ''} ${responseCode ?? ''} ${message ?? ''} ${durationMs ? `${durationMs}ms` : ''}`;

    switch (level) {
      case 'log':
        super.log(logMessage, context);
        break;
      case 'error':
        super.error(logMessage, stack, context, appErrors, message);
        break;
      case 'warn':
        super.warn(logMessage, context);
        break;
      case 'debug':
        super.debug(logMessage, context);
        break;
      case 'verbose':
        super.verbose(logMessage, context);
        break;
    }
  }

  private persistLog(level: 'log' | 'error' | 'warn', details: ILogDetails) {
    const {
      message,
      context,
      statusCode,
      responseCode,
      ip,
      path,
      userAgent,
      appErrors,
      method,
      durationMs,
    } = details;

    return this.logsService.createLog({
      appErrors,
      statusCode,
      ip,
      responseCode,
      path,
      userAgent,
      message,
      context,
      level,
      method,
      duration: durationMs,
    });
  }
}
