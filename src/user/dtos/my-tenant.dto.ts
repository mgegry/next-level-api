import { Role } from 'src/membership/tenant-membership.entity';
import { ErpProvider } from 'src/tenant/entities/tenant.entity';

export interface MyTenantDto {
  tenantId: number;
  tenantName: string;
  erpProvider: ErpProvider;
  role: Role;
  membershipId: number;
}
