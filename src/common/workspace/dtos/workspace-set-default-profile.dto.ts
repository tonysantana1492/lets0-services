import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class WorkspaceSetDefaultProfileDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  profileId: string;
}
