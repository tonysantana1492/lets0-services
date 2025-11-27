import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { oauth2_v2 } from 'googleapis';

import { SUBSCRIPTION_PLAN } from '@/common/stripe/enums/subscription-plan.enum';

export class ICreateGoogleUser {
  profile: oauth2_v2.Schema$Userinfo;

  @ApiProperty({ type: String, example: 'sdafdggfhjgf' })
  @IsString()
  @IsNotEmpty()
  googleAccessToken: string;

  @ApiProperty({ type: String, example: 'sddlkhklalajdlk' })
  @IsString()
  @IsNotEmpty()
  googleRefreshToken: string;

  @ApiProperty({ type: String, example: SUBSCRIPTION_PLAN.FREE })
  @IsString()
  @IsOptional()
  subscriptionPlan?: string;
}
