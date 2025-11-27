import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import {
  SessionCollectionName,
  UserCollectionName,
} from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { UserEntity } from '@/common/user/repository/entities/user.entity';

@DatabaseEntity({ collection: SessionCollectionName })
export class SessionEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: Date })
  @IsOptional()
  @IsDate()
  @Prop({ type: Date })
  expiresAt: Date | null;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, trim: true })
  refreshTokenJti: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true })
  ipAddress: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true })
  userAgent: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true })
  fingerprint: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: UserCollectionName })
  userId: Types.ObjectId | UserEntity;
}

const SessionSchema = SchemaFactory.createForClass(SessionEntity);

// Compose index for search
// SessionSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

// Index TTL, mongodb delete sessions automatic that has been expires
// SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SessionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

SessionSchema.plugin(mongooseLeanVirtuals);

export { SessionSchema };
export type SessionDoc = SessionEntity & Document;
