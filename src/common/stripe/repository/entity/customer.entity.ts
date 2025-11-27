import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';
import { Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

export const CustomerCollectionName = 'stripe-customer';

@DatabaseEntity({ collection: CustomerCollectionName })
export class CustomerEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, unique: true })
  stripeCustomerId: string;
}

const CustomerSchema = SchemaFactory.createForClass(CustomerEntity);

CustomerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

CustomerSchema.plugin(mongooseLeanVirtuals);

export { CustomerSchema };
export type CustomerDoc = CustomerEntity & Document;
