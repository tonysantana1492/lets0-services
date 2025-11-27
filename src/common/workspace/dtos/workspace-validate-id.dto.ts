import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ValidateWorkspaceIdDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  @Transform(({ value }) => value.toString())
  workspaceId: string;
}
