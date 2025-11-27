import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { UserCollectionName } from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { UserEntity } from '@/common/user/repository/entities/user.entity';

export const GmailAccountCollectionName = 'gmail-account';

@DatabaseEntity({ collection: GmailAccountCollectionName })
export class GmailAccountEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: 'string', example: 'gopsvksl249dsdfsf' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: '',
  })
  accessToken: string;

  @ApiProperty({ type: 'string', example: 'dgd4gopsvksl249dsdfsf' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: '',
  })
  refreshToken: string;

  @ApiProperty({ type: 'string', example: 'google' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: '',
  })
  provider: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: '',
  })
  email: string;

  @ApiProperty({ type: 'string', example: 'John Dove' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: '',
  })
  fullName: string;

  @ApiProperty({ type: Types.ObjectId })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: UserCollectionName,
  })
  userId: Types.ObjectId | UserEntity;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  tokenType: string | null | undefined;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  scope: string | null | undefined;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsOptional()
  @Prop({
    trim: true,
    type: Number,
    default: null,
  })
  expiryDate: number | null | undefined;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  avatar: string | undefined;
}

const GmailAccountSchema = SchemaFactory.createForClass(GmailAccountEntity);

GmailAccountSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

GmailAccountSchema.plugin(mongooseLeanVirtuals);

export { GmailAccountSchema };
export type GmailAccountDoc = GmailAccountEntity & Document;
