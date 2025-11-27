import { Prop } from '@nestjs/mongoose';

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Section<T> {
  @Prop({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  id: string;

  @Prop({ type: String, required: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Prop({ type: Number, required: true, min: 1 })
  @IsString()
  @IsOptional()
  columns?: number;

  @Prop({ type: String, required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @Prop({ type: Boolean, required: true })
  @IsString()
  @IsOptional()
  visible?: boolean;

  @Prop({ type: Boolean, required: true })
  @IsString()
  @IsOptional()
  separateLinks?: boolean;

  @Prop({ type: Array, required: true })
  @Transform(({ value }) => value || [], { toPlainOnly: true })
  @IsString()
  @IsNotEmpty()
  items: T[];

  @Prop({ type: String, required: true })
  @IsString()
  @IsOptional()
  icon?: string;
}
