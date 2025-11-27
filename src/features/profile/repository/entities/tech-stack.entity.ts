import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class TechStack {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  href: string;

  @Prop({ type: [String], required: true })
  categories: string[];

  @Prop({ type: Boolean, required: false })
  theme?: boolean;
}

@Schema({ _id: false })
export class TechStackSection extends Section<TechStack> {
  @Prop({ type: [TechStack], required: true })
  items: TechStack[];
}
