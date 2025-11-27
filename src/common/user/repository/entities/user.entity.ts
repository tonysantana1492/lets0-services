import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { ROLE } from '@/common/authorization/enums/role.enum';
import { IPermission, PERMISSION } from '@/common/authorization/types/permission.type';
import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import {
  UserCollectionName,
  WorkspaceCollectionName,
} from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { MfaConfig } from '@/common/user/repository/entities/mfa-config.entity';
import { WorkspaceEntity } from '@/common/workspace/repository/entities/workspace.entity';

@DatabaseEntity({ collection: UserCollectionName })
export class UserEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String, example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
  })
  firstName: string;

  @ApiProperty({ type: String, example: 'Dove' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
  })
  lastName: string;

  @ApiPropertyOptional({ type: String, example: '+1 786-767-1245' })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  phoneNumber?: string;

  @ApiProperty({ type: String, example: 'jdove@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Prop({ required: true, unique: true, trim: true, lowercase: true, type: String })
  email: string;

  @ApiPropertyOptional({ type: String, example: 'https://some_image_avatar.png' })
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  avatar?: string | null;

  // Authentication
  @ApiPropertyOptional({ type: String })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsOptional()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  password: string;

  @IsBoolean()
  @IsOptional()
  @Prop({ type: Boolean, required: false, default: false })
  isRegisteredWithGoogle: boolean;

  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: false,
  })
  emailVerified: boolean;

  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: false,
  })
  phoneVerified: boolean;

  // Roles and permissions

  @ApiProperty({ type: [String], example: [ROLE.USER], enum: ROLE })
  @IsEnum(ROLE, { each: true })
  @IsNotEmpty({ each: true })
  @Prop({
    type: [String],
    default: [ROLE.USER],
    enum: Object.values(ROLE),
  })
  roles: ROLE[];

  @ApiProperty({ type: [String], example: [], enum: PERMISSION })
  @IsEnum(PERMISSION, { each: true })
  @Prop({
    type: [String],
    default: [],
    enum: Object.values(PERMISSION),
  })
  permissions: IPermission[];

  // Estate and control session
  @IsDate()
  @IsOptional()
  @Prop({
    type: Date,
    default: null,
  })
  lastLoginDate?: Date;

  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  lastLoginIp?: string;

  @IsOptional()
  @IsNumber()
  @Prop({
    type: Number,
    default: 0,
  })
  loginAttemptCount: number;

  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  loginAttemptIp?: string | null;

  @IsDate()
  @IsOptional()
  @Prop({
    type: Date,
    default: null,
  })
  loginAttemptDate?: Date | null;

  @IsBoolean()
  @IsOptional()
  @Prop({ type: Boolean, default: false })
  isSuspended: boolean;

  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  // Relation with workspace N:1

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: WorkspaceCollectionName,
  })
  workspaceId: Types.ObjectId | WorkspaceEntity;

  // MFA Configuration
  @ApiPropertyOptional({ type: MfaConfig })
  @ValidateNested()
  @Type(() => MfaConfig)
  @Prop({ type: MfaConfig, default: {} })
  mfaConfig: MfaConfig;
}

const UserSchema = SchemaFactory.createForClass(UserEntity);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.plugin(mongooseLeanVirtuals);

export { UserSchema };
export type UserDoc = UserEntity & Document;
