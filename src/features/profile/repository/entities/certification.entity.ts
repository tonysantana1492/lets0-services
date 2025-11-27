import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class Certification {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  issuer: string;

  @Prop({ type: String, required: false })
  issuerLogoURL?: string;

  @Prop({ type: String, required: false })
  issuerIconName?: string;

  @Prop({ type: String, required: true })
  issueDate: string;

  @Prop({ type: String, required: true })
  credentialId: string;

  @Prop({ type: String, required: true })
  credentialURL: string;
}

@Schema({ _id: false })
export class CertificationsSection extends Section<Certification> {
  @Prop({ type: [Certification], required: true })
  items: Certification[];
}
