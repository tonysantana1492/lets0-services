import { ApiHideProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class StatusesDto {
  @ApiHideProperty()
  @IsBoolean()
  active: boolean;

  @ApiHideProperty()
  @IsBoolean()
  validated: boolean;
}
