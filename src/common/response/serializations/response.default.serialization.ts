import { ApiProperty } from '@nestjs/swagger';

import { ResponseMetadataSerialization } from '@/common/response/serializations/response.default-metadata.serialization';

import type { IMessage } from '../../language/interfaces/language.interface';

export class ResponseDefaultSerialization<T = Record<string, any>> {
  @ApiProperty({
    name: 'responseCode',
    type: Number,
    required: true,
    nullable: false,
    description: 'return specific status code for every endpoints',
    example: '200',
  })
  responseCode?: string;

  @ApiProperty({
    name: 'message',
    required: true,
    nullable: false,
    description: 'Message base on language',
    example: 'message endpoint',
  })
  message?: string | IMessage;

  @ApiProperty({
    name: '_metadata',
    required: true,
    nullable: false,
    description: 'Contain metadata about API',
    type: Object,
    example: {
      languages: ['en'],
      timestamp: 1_660_190_937_231,
      timezone: 'America/New_York',
      requestId: '40c2f734-7247-472b-bc26-8eff6e669781',
      path: '/api/v1/example',
      version: '1',
      repoVersion: '1.0.0',
    },
  })
  _metadata?: ResponseMetadataSerialization;

  data?: T;
}
