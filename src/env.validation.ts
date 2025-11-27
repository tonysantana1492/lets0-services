import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

import { ENUM_APP_ENVIRONMENT } from './common/app-config/enums/app.enum';
import { ERROR_CODES } from './common/error/constants/error-code';
import { AppRequestException } from './common/error/exceptions/app-request.exception';

class EnvironmentVariables {
  // App
  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsNumber()
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  HOST: string;

  @IsEnum(ENUM_APP_ENVIRONMENT)
  @IsNotEmpty()
  NODE_ENV: ENUM_APP_ENVIRONMENT;

  @IsBoolean()
  @IsNotEmpty()
  DOCS_ENABLED: boolean;

  @IsNumber()
  @IsNotEmpty()
  API_VERSION: number;

  @IsBoolean()
  @IsNotEmpty()
  API_VERSIONING_ENABLE: boolean;

  @IsString()
  @IsNotEmpty()
  LANGUAGE: string;

  // Database
  @IsString()
  @IsNotEmpty()
  DATABASE_OPTIONS: string;

  @IsString()
  @IsNotEmpty()
  MONGO_URL: string;

  @IsBoolean()
  @IsNotEmpty()
  DATABASE_DEBUG: boolean;

  // Connection Settings
  @IsString()
  @IsNotEmpty()
  CLIENT_URL: string;

  @IsOptional()
  @IsString()
  DOMAIN: string;

  @IsBoolean()
  @IsNotEmpty()
  HTTP_ENABLE: boolean;

  @IsString()
  @IsNotEmpty()
  HTTP_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  HTTP_PORT: number;

  // Authentication Settings
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_SECRET_KEY: string;
}

function assertUniqueResponseCodes(obj: Record<string, { responseCode: string }>) {
  const seen = new Set<string>();
  for (const [key, item] of Object.entries(obj)) {
    const code = item.responseCode;
    if (seen.has(code)) {
      throw new Error(`Duplicated responseCode '${code}' in ERROR_CODES['${key}']`);
    }

    seen.add(code);
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  assertUniqueResponseCodes(ERROR_CODES);

  if (errors.length > 0) {
    throw new AppRequestException({
      ...ERROR_CODES.ENV_CONFIG_MISSING,
      errors,
    });
  }

  return validatedConfig;
}
