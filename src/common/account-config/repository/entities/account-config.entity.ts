import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { UserCollectionName } from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { UserEntity } from '@/common/user/repository/entities/user.entity';

export const AccountConfigCollectionName = 'account-config';

@DatabaseEntity({ collection: AccountConfigCollectionName })
export class AccountConfigEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: [Number], required: true })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Prop({
    trim: true,
    type: [Number],
    default: [20, 32, 48],
  })
  layoutWidths: number[];

  @ApiProperty({ type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  @Prop({
    type: Boolean,
    default: false,
  })
  isLeftSidebarCollapsed: boolean;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  leftSidebarItemSelected?: string | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  accountIdSelected?: string | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @Prop({
    trim: true,
    type: String,
    default: 'en',
  })
  locale?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @Prop({
    trim: true,
    type: String,
    default: 'system',
  })
  theme?: string;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: UserCollectionName,
  })
  userId: Types.ObjectId | UserEntity;
}

const AccountConfigSchema = SchemaFactory.createForClass(AccountConfigEntity);

AccountConfigSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

AccountConfigSchema.plugin(mongooseLeanVirtuals);

export { AccountConfigSchema };
export type AccountConfigDoc = AccountConfigEntity & Document;
