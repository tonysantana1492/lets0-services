import { IsNotEmpty, IsString } from 'class-validator';

export class IdParamDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
