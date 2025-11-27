import { IsEnum, IsNotEmpty } from 'class-validator';

import { EMAIL_TEMPLATE } from '@/common/user/enum/email-template.enum';

export class TestEmailBodyDto {
  @IsEnum(EMAIL_TEMPLATE)
  @IsNotEmpty()
  type: EMAIL_TEMPLATE;
}
