import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

import { DatabaseBaseEntityAbstract } from '@/common/database/abstracts/mongo/database.base-entity.abstract';
import {
  DATABASE_CREATED_AT_FIELD_NAME,
  DATABASE_DELETED_AT_FIELD_NAME,
  DATABASE_UPDATED_AT_FIELD_NAME,
} from '@/common/database/constants/database.constant';
import { DatabaseDefaultObjectId } from '@/common/database/constants/database.function.constant';

export abstract class DatabaseMongoObjectIdEntityAbstract extends DatabaseBaseEntityAbstract {
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  @Prop({
    type: Types.ObjectId,
    default: DatabaseDefaultObjectId,
    auto: true,
  })
  @Transform(({ value }) => value.toString())
  _id?: Types.ObjectId;

  @Prop({
    required: false,
    type: Date,
  })
  [DATABASE_DELETED_AT_FIELD_NAME]?: Date;

  @Prop({
    required: false,
    type: Date,
  })
  [DATABASE_CREATED_AT_FIELD_NAME]?: Date;

  @Prop({
    required: false,
    type: Date,
  })
  [DATABASE_UPDATED_AT_FIELD_NAME]?: Date;
}
