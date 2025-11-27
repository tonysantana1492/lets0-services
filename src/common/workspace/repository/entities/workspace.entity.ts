import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import mongoose, { Document, Types } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

import { DatabaseMongoObjectIdEntityAbstract } from '@/common/database/abstracts/mongo/entities/database.mongo.object-id.entity.abstract';
import {
  ProfileCollectionName,
  UserCollectionName,
  WorkspaceCollectionName,
} from '@/common/database/constants/collection-names.constant';
import { DatabaseEntity } from '@/common/database/decorators/database.decorator';
import { UserEntity } from '@/common/user/repository/entities/user.entity';
import { ProfileEntity } from '@/features/profile/repository/entities/profile.entity';

@DatabaseEntity({ collection: WorkspaceCollectionName })
export class WorkspaceEntity extends DatabaseMongoObjectIdEntityAbstract {
  @ApiProperty({ type: String, example: 'Lets0' })
  @IsString()
  @IsNotEmpty()
  @Prop({
    trim: true,
    type: String,
    default: null,
  })
  name: string;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop({ default: false })
  activeSubscription: boolean;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @Prop({ type: String, required: true, unique: true })
  stripeCustomerId: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  // sparse allows null values while keeping unique constraint
  @Prop({ type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true })
  subdomain: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  @Prop({ type: String, required: false, unique: true, sparse: true, trim: true, lowercase: true })
  customDomain: string;

  @IsObject()
  @IsOptional()
  @Prop({ type: Object, required: false, default: {} })
  billingAddress: Record<string, any>;

  @IsObject()
  @IsOptional()
  @Prop({ type: Object, required: false, default: {} })
  paymentMethod: Record<string, any>;

  // Relation with User 1:1
  // In Application logic, ownerId is always set after workspace creation
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  @IsNotEmpty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false, // En DB is optional to allow creation before setting owner
    ref: UserCollectionName,
    validate: {
      validator: (v: Types.ObjectId) => v != null,
      message: 'Owner ID is required after workspace initialization',
    },
  })
  ownerId?: Types.ObjectId | UserEntity;

  // Relation with Profile 1:1
  @ApiProperty({ type: Types.ObjectId, required: false })
  @IsMongoId()
  @IsOptional()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: ProfileCollectionName,
  })
  defaultProfileId?: Types.ObjectId | ProfileEntity;

  @IsBoolean()
  @IsOptional()
  @Prop({ type: Boolean, required: false, default: true })
  isActive: boolean;
}

const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceEntity);

WorkspaceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

WorkspaceSchema.plugin(mongooseLeanVirtuals);

export { WorkspaceSchema };
export type WorkspaceDoc = WorkspaceEntity & Document;
