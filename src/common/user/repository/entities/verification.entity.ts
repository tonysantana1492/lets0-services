import { Prop, Schema } from '@nestjs/mongoose';

import { ErrorEntity } from './error-entity';

@Schema({ _id: false })
export class VerificationEntity {
  @Prop({ default: null })
  attempts: number | null;

  @Prop({ default: null })
  expire_at: number | null;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  strategy: string;

  @Prop()
  error?: ErrorEntity;
}
