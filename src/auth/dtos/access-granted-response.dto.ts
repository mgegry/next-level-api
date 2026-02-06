import { Role } from 'src/membership/tenant-membership.entity';

export interface TenantIdName {
  id: number;
  name: string;
  role: Role;
}

export interface AccessGrantedResponseDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: number;
  // tenants: TenantIdName[];
  createdAt: Date;
  updatedAt: Date;
}
