import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { PaginationListDto } from '@/common/pagination/dtos/pagination.list.dto';

export class GetEmailSuggestionsQueryDto extends PaginationListDto {
  @ApiProperty({ type: String, required: false, default: '' })
  @IsOptional()
  @IsString()
  search?: string;
}
