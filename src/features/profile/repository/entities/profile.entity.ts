import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import {
  ProfileCollectionName,
  WorkspaceCollectionName,
} from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { WorkspaceEntity } from '@/common/workspace/repository/entities/workspace.entity';
import { Sections } from '@/features/profile/repository/entities/section.entity';

@DatabaseEntity({ collection: ProfileCollectionName })
export class ProfileEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: 'boolean', example: true })
  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({ type: 'string', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  firstName: string;

  @ApiProperty({ type: 'string', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  lastName: string;

  @ApiProperty({ type: 'string', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  displayName: string;

  @ApiProperty({ type: 'string', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  username: string;

  @ApiProperty({ type: 'string', example: 'male' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  gender: string;

  @ApiProperty({ type: 'string', example: 'he/him' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  pronouns: string;

  @ApiProperty({ type: 'string', example: 'Software developer passionate about technology' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  bio: string;

  @ApiProperty({ type: [String], example: ['I love coding', 'Technology enthusiast'] })
  @IsArray()
  @IsString({ each: true })
  @Prop({
    type: [String],
    required: true,
  })
  flipSentences: string[];

  @ApiProperty({ type: 'string', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  twitterUsername: string;

  @ApiProperty({ type: 'string', example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  githubUserName: string;

  @ApiProperty({ type: 'string', example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  address: string;

  @ApiProperty({ type: 'string', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  phoneNumber: string;

  @ApiProperty({ type: 'string', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  email: string;

  @ApiProperty({ type: 'string', example: 'https://johndoe.com' })
  @IsUrl()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  website: string;

  @ApiProperty({
    type: [String],
    example: ['https://blog.johndoe.com', 'https://portfolio.johndoe.com'],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @Prop({
    type: [String],
    required: true,
  })
  otherWebsites: string[];

  @ApiProperty({ type: 'string', example: 'Senior Software Engineer' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  jobTitle: string;

  @ApiProperty({ type: 'string', example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  avatar: string;

  @ApiProperty({ type: 'string', example: 'https://example.com/og-image.jpg' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    required: true,
  })
  ogImage: string;

  @ApiProperty({ type: [String], example: ['javascript', 'typescript', 'nodejs'] })
  @IsArray()
  @IsString({ each: true })
  @Prop({
    type: [String],
    required: true,
  })
  keywords: string[];

  @ApiProperty({ type: Object })
  @Type(() => Object)
  @Prop({
    type: Object,
    default: {},
  })
  metadata: Record<string, any>;

  @ApiProperty({ type: Types.ObjectId, required: false })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: WorkspaceCollectionName,
  })
  workspaceId: Types.ObjectId | WorkspaceEntity | string;

  @ApiProperty({ type: Sections })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Sections)
  @Prop({
    type: Sections,
    default: () => ({}),
  })
  sections: Sections;
}

const ProfileSchema = SchemaFactory.createForClass(ProfileEntity);

ProfileSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ProfileSchema.plugin(mongooseLeanVirtuals);

export { ProfileSchema };
export type ProfileDoc = ProfileEntity & Document;
