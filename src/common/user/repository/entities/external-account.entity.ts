import { Prop, Schema } from '@nestjs/mongoose';

import { VerificationEntity } from './verification.entity';

@Schema({ _id: false })
export class ExternalAccountEntity {
  @Prop({ required: true })
  approved_scopes: string;

  @Prop({ required: true })
  created_at: number;

  @Prop({ required: true })
  email_address: string;

  @Prop({ required: true })
  family_name: string;

  @Prop({ required: true })
  given_name: string;

  @Prop({ required: true })
  google_id: string;

  @Prop({ required: true })
  id: string;

  @Prop({ default: null })
  label: string | null;

  @Prop({ required: true })
  object: string;

  @Prop({ required: true })
  picture: string;

  @Prop({ type: Object, default: {} })
  public_metadata: Record<string, unknown>;

  @Prop({ required: true })
  updated_at: number;

  @Prop({ default: null })
  username: string | null;

  @Prop({ required: true })
  verification: VerificationEntity;
}
