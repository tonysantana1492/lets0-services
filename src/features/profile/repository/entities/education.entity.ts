import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';
import { Experience } from '@/features/profile/repository/entities/experience.entity';

@Schema({ _id: false })
export class EducationsSection extends Section<Experience> {
  @Prop({ type: [Experience], required: true })
  items: Experience[];
}
