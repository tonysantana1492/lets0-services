import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

export const ProductCollectionName = 'stripe-product';

@DatabaseEntity({ collection: ProductCollectionName })
export class ProductEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, unique: true })
  productStripeId: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @IsNotEmpty()
  @Prop({ type: Boolean, required: true })
  active: boolean;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  @Prop({ type: String, required: false })
  image?: string;

  @ApiProperty({ type: Object })
  @IsString()
  @IsOptional()
  @Prop({ type: Object, required: false, default: {} })
  metadata?: Record<string, any>;
}

const ProductSchema = SchemaFactory.createForClass(ProductEntity);

ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ProductSchema.plugin(mongooseLeanVirtuals);

export { ProductSchema };
export type ProductDoc = ProductEntity & Document;
