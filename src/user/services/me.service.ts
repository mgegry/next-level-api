import { Injectable } from '@nestjs/common';
import {
  MembershipStatus,
  Role,
} from 'src/tenant/entities/tenant-membership.entity';
import { ErpProvider } from 'src/tenant/entities/tenant.entity';
import { TenantMembershipService } from 'src/tenant/services/tenant-membership.service';

export type MyTenantDto = {
  tenantId: number;
  tenantName: string;
  erpProvider: ErpProvider;
  membershipId: number;
  role: Role;
};

@Injectable()
export class MeService {
  constructor(
    private readonly tenantMembershipService: TenantMembershipService,
  ) {}

  async getMyTenants(userId: number): Promise<MyTenantDto[]> {
    const memberships =
      await this.tenantMembershipService.getActiveByUserWithTenant(userId);

    return memberships
      .filter((m) => m.status === MembershipStatus.ACTIVE) // defensive
      .map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenant.name,
        erpProvider: m.tenant.erpProvider,
        membershipId: m.id,
        role: m.role,
      }));
  }
}
