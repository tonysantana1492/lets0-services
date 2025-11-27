import type { LogLevel } from '@nestjs/common/services/logger.service';

export function getLogLevels(isProduction: boolean): LogLevel[] {
  if (isProduction) {
    return ['debug', 'warn', 'error'];
  }

  return ['error', 'warn', 'debug', 'verbose', 'log'];
}
