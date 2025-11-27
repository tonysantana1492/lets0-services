import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ProfileValidateIdDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  profileId: string;
}
