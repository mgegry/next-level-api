import { IsInt, Min } from 'class-validator';

export class SwitchTenantRequestDto {
  @IsInt()
  @Min(1)
  tenantId: number;
}
