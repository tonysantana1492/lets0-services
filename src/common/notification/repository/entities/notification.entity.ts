import type { Document } from 'mongoose';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import { UserCollectionName } from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { UserEntity } from '@/common/user/repository/entities/user.entity';

import type { INotification } from '../../interfaces/notification.interface';
import { ENUM_NOTIFICATION_TYPE } from '../../constants/notification.enum';

export const NotificationCollectionName = 'notifications';

@DatabaseEntity({ collection: NotificationCollectionName })
export class NotificationEntity
  extends DatabaseMongoObjectIdEntityAbstract
  implements INotification
{
  constructor(data?: Partial<NotificationEntity>) {
    super();

    if (data) {
      Object.assign(this, data);
    }
  }

  @Prop({
    type: String,
    enum: ENUM_NOTIFICATION_TYPE,
    index: true,
  })
  type: ENUM_NOTIFICATION_TYPE;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRead: boolean;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  message: string;

  @Prop({
    type: Object,
    default: {},
  })
  data: Record<string, any>;

  @ApiProperty({ type: Types.ObjectId })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: UserCollectionName,
  })
  userId: Types.ObjectId | UserEntity;
}

const NotificationSchema = SchemaFactory.createForClass(NotificationEntity);

NotificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

NotificationSchema.plugin(mongooseLeanVirtuals);

export { NotificationSchema };
export type NotificationDoc = NotificationEntity & Document;
