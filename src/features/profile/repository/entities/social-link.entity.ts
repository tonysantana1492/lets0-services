import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class SocialLink {
  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  href: string;
}

@Schema({ _id: false })
export class SocialLinksSection extends Section<SocialLink> {
  @Prop({ type: [SocialLink], required: true })
  items: SocialLink[];
}
