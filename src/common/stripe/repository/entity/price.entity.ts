import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import Stripe from 'stripe';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

export enum PRICING_TYPE {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

export enum PRICING_PLAN_INTERVAL {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export const PriceCollectionName = 'stripe-price';

@DatabaseEntity({ collection: PriceCollectionName })
export class PriceEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, unique: true })
  priceStripeId: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @Prop({
    type: String,
    required: true,
  })
  productStripeId: string;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  @IsNotEmpty()
  @Prop({ type: Boolean, required: true })
  active: boolean;

  @ApiProperty({ type: Boolean, example: 'Some description' })
  @IsString()
  @IsOptional()
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({ type: Number, example: 35 })
  @IsNumber()
  @IsNotEmpty()
  @Prop({ type: Number, required: true })
  unitAmount: number;

  // 3-letter ISO code in lowercase
  @ApiProperty({ type: String, example: 'usd' })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true, minlength: 3, maxlength: 3 })
  currency: string;

  @ApiProperty({ type: String, example: PRICING_TYPE.ONE_TIME, enum: PRICING_TYPE })
  @IsNotEmpty()
  @IsEnum(PRICING_TYPE)
  @Prop({ type: String, required: true, enum: Object.values(PRICING_TYPE) })
  type: Stripe.Price.Type;

  @ApiProperty({ type: String, example: PRICING_PLAN_INTERVAL.MONTH, enum: PRICING_PLAN_INTERVAL })
  @IsNotEmpty()
  @IsEnum(PRICING_PLAN_INTERVAL)
  @Prop({ type: String, required: true, enum: Object.values(PRICING_PLAN_INTERVAL) })
  interval: Stripe.Price.Recurring.Interval;

  @ApiProperty({ type: Number, example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Prop({ type: Number, required: true })
  intervalCount: number;

  @ApiProperty({ type: Number, example: 2 })
  @IsNumber()
  @IsOptional()
  @Prop({ type: Number, required: false })
  trialPeriodDays?: number;

  @ApiProperty({ type: Object, example: {} })
  @IsObject()
  @IsOptional()
  @Prop({ type: Object, default: {}, required: false })
  metadata?: Record<string, any>;
}

const PriceSchema = SchemaFactory.createForClass(PriceEntity);

PriceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

PriceSchema.plugin(mongooseLeanVirtuals);

export { PriceSchema };
export type PriceDoc = PriceEntity & Document;
