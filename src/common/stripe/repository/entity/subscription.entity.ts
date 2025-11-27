import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import Stripe from 'stripe';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { UserCollectionName } from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { WorkspaceEntity } from '@/common/workspace/repository/entities/workspace.entity';

export enum SUBSCRIPTION_STATUS {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
}

export const SubscriptionCollectionName = 'stripe-subscription';

@DatabaseEntity({ collection: SubscriptionCollectionName })
export class SubscriptionEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, unique: true })
  stripeSubscriptionId: string;

  @ApiProperty({ type: Types.ObjectId })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: UserCollectionName,
  })
  workspaceId: Types.ObjectId | WorkspaceEntity;

  @ApiProperty({ type: String, example: SUBSCRIPTION_STATUS.ACTIVE, enum: SUBSCRIPTION_STATUS })
  @IsEnum(SUBSCRIPTION_STATUS)
  @IsNotEmpty()
  @Prop({ type: String, required: true, enum: Object.values(SUBSCRIPTION_STATUS) })
  status: Stripe.Subscription.Status;

  @ApiProperty({ type: Object, example: {} })
  @IsObject()
  @IsOptional()
  @Prop({ type: Object, required: false, default: {} })
  metadata?: Record<string, any>;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({
    type: String,
    required: true,
  })
  priceId: string;

  @ApiProperty({ type: Number, example: 2 })
  @IsNumber()
  @IsNotEmpty()
  @Prop({ type: Number, required: true })
  quantity: number;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  @IsNotEmpty()
  @Prop({ type: Boolean, required: true })
  cancelAtPeriodEnd: boolean;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false, default: () => new Date().toISOString() })
  created?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false, default: () => new Date().toISOString() })
  currentPeriodStart?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false, default: () => new Date().toISOString() })
  currentPeriodEnd?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false })
  endedAt?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false })
  cancelAt?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false })
  canceledAt?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false })
  trialStart?: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  @Prop({ type: String, required: false })
  trialEnd?: string;
}

const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionEntity);

SubscriptionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

SubscriptionSchema.plugin(mongooseLeanVirtuals);

export { SubscriptionSchema };
export type SubscriptionDoc = SubscriptionEntity & Document;
