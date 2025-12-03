import { PaginationDto } from '../domain/pagination.dto';
import { BaseResponseDto } from './base-response.dto';

export interface PaginatedResponseDto<T> extends BaseResponseDto {
  pagination: PaginationDto;
  data: T[];
}
