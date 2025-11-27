import { ConsoleLogger } from '@nestjs/common';

export class InternalDisabledLogger extends ConsoleLogger {
  public static readonly contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'NestApplication',
  ];

  log(_: any, context?: string, ...args: any[]): void {
    if (!InternalDisabledLogger.contextsToIgnore.includes(context ?? '')) {
      super.log(args);
    }
  }
}
