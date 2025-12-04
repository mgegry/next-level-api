import { BaseResponseDto } from './base-response.dto';

export interface DataResponseDto<T> extends BaseResponseDto {
  data: T | T[];
}
