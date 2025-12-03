import { SoftoneErrorResponseDto } from './softone-error-response.dto';
import { SoftoneLoginSuccessResponseDto } from './softone-login-success-response.dto';

export type SoftoneLoginResponseDto =
  | SoftoneLoginSuccessResponseDto
  | SoftoneErrorResponseDto;
