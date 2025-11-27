import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ErrorEntity {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  long_message: string;

  @Prop({ required: true })
  message: string;
}
