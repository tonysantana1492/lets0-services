import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateOAuth2UrlQueryDto {
  @IsNotEmpty()
  @IsString()
  subscriptionPlan: string;

  @IsNotEmpty()
  @IsString()
  fingerprint: string;

  @IsNotEmpty()
  @IsString()
  redirectTo: string;
}

export class AuthCallbackQueryDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  state: string;
}
