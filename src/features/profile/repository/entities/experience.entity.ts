// eslint-disable-next-line max-classes-per-file
import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class ExperiencePosition {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: {
      start: { type: String, required: true },
      end: { type: String, required: false },
    },
    required: true,
  })
  employmentPeriod: {
    start: string;
    end?: string;
  };

  @Prop({ type: String, required: false })
  location?: string;

  @Prop({ type: String, required: false })
  employmentType?: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  icon?: string;

  @Prop({ type: [String], required: false })
  skills?: string[];

  @Prop({ type: Boolean, required: false })
  isExpanded?: boolean;
}

@Schema({ _id: false })
export class Experience {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  companyName: string;

  @Prop({ type: String, required: false })
  companyLogo?: string;

  @Prop({ type: [ExperiencePosition], required: true })
  positions: ExperiencePosition[];

  @Prop({ type: Boolean, required: false })
  isCurrentEmployer?: boolean;

  @Prop({ type: String, required: false })
  website?: string;
}

@Schema({ _id: false })
export class ExperiencesSection extends Section<Experience> {
  @Prop({ type: [Experience], required: true })
  items: Experience[];
}
