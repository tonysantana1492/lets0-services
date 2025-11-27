import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

import { GmailAccountCollectionName, GmailAccountEntity } from './gmail-account.entity';

export const GmailThreadCollectionName = 'gmail-thread';

@DatabaseEntity({ collection: GmailThreadCollectionName })
export class GmailThreadEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: Types.ObjectId })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: GmailAccountCollectionName,
  })
  accountId: Types.ObjectId | GmailAccountEntity;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  subject: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  from: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  to: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  cc: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  bcc: string | null;

  @ApiProperty({ type: Date, required: false })
  @IsDate()
  @IsOptional()
  @Prop({
    trim: true,
    type: Date,
    default: null,
  })
  date: Date | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  body: string | null;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  snippet: string | null;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  @Prop({
    trim: true,
    type: Object,
    default: null,
  })
  attachments: any;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @Prop({
    trim: true,
    type: [String],
    default: [],
  })
  labelIds: string[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  threadId: string | null;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
  })
  emailId: string;
}

const GmailThreadSchema = SchemaFactory.createForClass(GmailThreadEntity);

GmailThreadSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

GmailThreadSchema.plugin(mongooseLeanVirtuals);

export { GmailThreadSchema };
export type GmailThreadDoc = GmailThreadEntity & Document;
