import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class Award {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  prize: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: String, required: true })
  grade: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  referenceLink?: string;
}

@Schema({ _id: false })
export class AwardsSection extends Section<Award> {
  @Prop({ type: [Award], required: true })
  items: Award[];
}
