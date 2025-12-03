import { SoftoneAuthenticateSuccessResponseDto } from './softone-authenticate-success-response.dto';
import { SoftoneErrorResponseDto } from './softone-error-response.dto';

export type SoftoneAuthenticateResponseDto =
  | SoftoneAuthenticateSuccessResponseDto
  | SoftoneErrorResponseDto;
