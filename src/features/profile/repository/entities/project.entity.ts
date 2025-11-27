import { Prop, Schema } from '@nestjs/mongoose';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class Project {
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
  period: {
    start: string;
    end?: string;
  };

  @Prop({ type: String, required: true })
  link: string;

  @Prop({ type: [String], required: true })
  skills: string[];

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  logo?: string;

  @Prop({ type: Boolean, required: false })
  isExpanded?: boolean;
}

@Schema({ _id: false })
export class ProjectsSection extends Section<Project> {
  @Prop({ type: [Project], required: true })
  items: Project[];
}
