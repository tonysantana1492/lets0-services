import { ApiProperty } from '@nestjs/swagger';

import { ENUM_LANGUAGE } from '@/common/language/enums/language.enum';

export class LanguageSerialization {
  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_LANGUAGE,
    type: 'array',
    isArray: true,
  })
  language: ENUM_LANGUAGE[];
}
