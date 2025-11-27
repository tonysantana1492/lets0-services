import { Prop, SchemaFactory } from '@nestjs/mongoose';

import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { LogCollectionName } from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

@DatabaseEntity({ collection: LogCollectionName })
export class LogEntity extends DatabaseMongoObjectIdEntityAbstract {
  @Prop({
    trim: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  context?: string;

  @Prop({
    trim: true,
    type: String,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @Prop({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  level: string;

  @Prop({
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  statusCode?: number;

  @Prop({
    type: String,
  })
  @IsString()
  @IsOptional()
  responseCode?: string;

  @Prop({
    type: [Object],
  })
  @IsArray()
  @IsOptional()
  appErrors?: Array<Record<string, any>>;

  @Prop({
    type: String,
  })
  @IsString()
  @IsOptional()
  ip?: string;

  @Prop({
    type: String,
  })
  @IsString()
  @IsOptional()
  path?: string;

  @Prop({
    type: String,
  })
  @IsString()
  @IsOptional()
  method?: string;

  @Prop({
    type: [Object],
  })
  @IsObject()
  @IsOptional()
  userAgent?: Record<string, any>;

  @Prop({
    type: String,
  })
  @IsString()
  @IsOptional()
  duration: string;
}

const LogSchema = SchemaFactory.createForClass(LogEntity);

LogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

LogSchema.plugin(mongooseLeanVirtuals);

export { LogSchema };
export type LogDoc = LogEntity & Document;
