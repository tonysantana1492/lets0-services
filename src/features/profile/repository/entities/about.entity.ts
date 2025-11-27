import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { Section } from '@/features/profile/repository/entities/base-section.entity';

@Schema({ _id: false })
export class About {
  @Prop({ type: String, required: true })
  @IsString()
  @IsOptional()
  id: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsOptional()
  title: string;

  @Prop({ type: String, required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsOptional()
  content: string;
}

@Schema({ _id: false })
export class AboutSection extends Section<About> {
  @ApiProperty({ type: [About] })
  @Prop({ type: [About], required: true })
  @Type(() => About)
  @ValidateNested({ each: true })
  items: About[];
}
