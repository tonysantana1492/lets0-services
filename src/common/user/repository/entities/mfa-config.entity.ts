import { Prop, Schema } from '@nestjs/mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { MFA_METHOD } from '@/common/authorization/enums/mfa-method.enum';

@Schema({ _id: false })
export class MfaConfig {
  @ApiPropertyOptional({ description: 'Encrypted secret for TOTP (Google Authenticator)' })
  @IsString()
  @IsOptional()
  @Prop({ trim: true, default: null })
  googleAuthSecretEncrypted?: string;

  @ApiPropertyOptional({ description: 'Encrypted last-used TOTP code for replay protection' })
  @IsString()
  @IsOptional()
  @Prop({ trim: true, default: null })
  otpCodeTokenEncrypted?: string;

  @ApiPropertyOptional({ description: 'Indicates if MFA is active for the user' })
  @IsBoolean()
  @IsOptional()
  @Prop({ type: Boolean, default: false })
  isEnable?: boolean;

  @ApiPropertyOptional({ type: [String], enum: MFA_METHOD })
  @IsEnum(MFA_METHOD, { each: true })
  @IsOptional()
  @Prop({ type: [String], enum: Object.values(MFA_METHOD), default: [] })
  methods?: MFA_METHOD[];
}
