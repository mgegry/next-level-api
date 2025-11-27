import { BaseResponseDto } from './base-response.dto';
import { PaginationDto } from './pagination.dto';

export interface PaginatedResponseDto<T> extends BaseResponseDto {
  pagination: PaginationDto;
  data: T[];
}
