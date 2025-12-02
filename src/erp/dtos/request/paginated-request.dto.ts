import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatedRequestDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageNumber: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize: number;
}
