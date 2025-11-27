import { ApiProperty } from '@nestjs/swagger';

import { faker } from '@faker-js/faker';
import { Type } from 'class-transformer';
import { IsMongoId } from 'class-validator';

export class DatabaseIdDto {
  @ApiProperty({
    description: 'Id that representative with your target data',
    example: faker.string.uuid(),
    required: false,
    nullable: true,
  })
  @Type(() => String)
  @IsMongoId()
  _id?: string;
}
