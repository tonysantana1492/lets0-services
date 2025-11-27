import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { AboutSection } from '@/features/profile/repository/entities/about.entity';
import { AwardsSection } from '@/features/profile/repository/entities/award.entity';
import { CertificationsSection } from '@/features/profile/repository/entities/certification.entity';
import { EducationsSection } from '@/features/profile/repository/entities/education.entity';
import { ExperiencesSection } from '@/features/profile/repository/entities/experience.entity';
import { ProjectsSection } from '@/features/profile/repository/entities/project.entity';
import { SocialLinksSection } from '@/features/profile/repository/entities/social-link.entity';
import { TechStackSection } from '@/features/profile/repository/entities/tech-stack.entity';

@Schema({ _id: false })
export class Sections {
  @ApiProperty({ type: AboutSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AboutSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: AboutSection,
    default: () => ({}),
  })
  about?: AboutSection;

  @ApiProperty({ type: AwardsSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AwardsSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: AwardsSection,
    default: () => ({}),
  })
  awards?: AwardsSection;

  @ApiProperty({ type: TechStackSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TechStackSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: TechStackSection,
    default: () => ({}),
  })
  techStack?: TechStackSection;

  @ApiProperty({ type: ProjectsSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProjectsSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: ProjectsSection,
    default: () => ({}),
  })
  projects?: ProjectsSection;

  @ApiProperty({ type: ExperiencesSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ExperiencesSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: ExperiencesSection,
    default: () => ({}),
  })
  experiences?: ExperiencesSection;

  @ApiProperty({ type: EducationsSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EducationsSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: EducationsSection,
    default: () => ({}),
  })
  educations?: EducationsSection;

  @ApiProperty({ type: CertificationsSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CertificationsSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: CertificationsSection,
    default: () => ({}),
  })
  certifications?: CertificationsSection;

  @ApiProperty({ type: SocialLinksSection })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SocialLinksSection)
  @Transform(({ value }) => value || {}, { toPlainOnly: true })
  @Prop({
    type: SocialLinksSection,
    default: () => ({}),
  })
  socialLinks?: SocialLinksSection;
}
