import type { Document } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';

import {
  ENUM_NOTIFICATION_EVENT_TYPE,
  ENUM_NOTIFICATION_METHOD_TYPE,
} from '../../constants/notification-method.enum';

export const NotificationMethodCollectionName = 'notification-methods';

@DatabaseEntity({ collection: NotificationMethodCollectionName })
export class NotificationMethodEntity extends DatabaseMongoObjectIdEntityAbstract {
  constructor(data?: Partial<NotificationMethodEntity>) {
    super();

    if (data) {
      Object.assign(this, data);
    }
  }

  @ApiPropertyOptional({
    enum: ENUM_NOTIFICATION_METHOD_TYPE,
    default: ENUM_NOTIFICATION_METHOD_TYPE.EMAIL,
    description: 'The type of the notification method',
    example: ENUM_NOTIFICATION_METHOD_TYPE.EMAIL,
  })
  @IsOptional()
  @IsEnum(ENUM_NOTIFICATION_METHOD_TYPE)
  @Prop({
    type: String,
    enum: ENUM_NOTIFICATION_METHOD_TYPE,
    default: ENUM_NOTIFICATION_METHOD_TYPE.EMAIL,
  })
  type: ENUM_NOTIFICATION_METHOD_TYPE;

  @ApiPropertyOptional({
    enum: ENUM_NOTIFICATION_EVENT_TYPE,
    default: ENUM_NOTIFICATION_EVENT_TYPE.ALL_ORDER,
    description: 'The event type of the notification method',
    example: ENUM_NOTIFICATION_EVENT_TYPE.ALL_ORDER,
  })
  @IsOptional()
  @IsEnum(ENUM_NOTIFICATION_EVENT_TYPE)
  @Prop({
    type: String,
    enum: ENUM_NOTIFICATION_EVENT_TYPE,
    default: ENUM_NOTIFICATION_EVENT_TYPE.ALL_ORDER,
  })
  eventType: ENUM_NOTIFICATION_EVENT_TYPE;

  @ApiPropertyOptional({
    default: true,
    description: 'The status of the notification method',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'The destination of the notification method',
    example: 'john@example.com',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @Prop({
    type: String,
    index: true,
    required: true,
  })
  contactInfo: string;

  @ApiPropertyOptional({
    description: 'The label of the notification method',
    example: 'Email',
    type: String,
  })
  @IsString()
  @IsOptional()
  @Prop({
    type: String,
  })
  label: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'Flag to indicate if the notification method is only available during business hours',
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Prop({
    type: Boolean,
    default: false,
  })
  businessHoursOnly: boolean;
}

const NotificationMethodSchema = SchemaFactory.createForClass(NotificationMethodEntity);

NotificationMethodSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

NotificationMethodSchema.plugin(mongooseLeanVirtuals);

export { NotificationMethodSchema };
export type NotificationMethodDoc = NotificationMethodEntity & Document;
