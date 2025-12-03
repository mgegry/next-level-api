import { PaginationDto } from '../domain/pagination.dto';

export interface BaseResponseDto {
  pagination?: PaginationDto;
}
