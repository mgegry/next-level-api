import { Injectable } from '@nestjs/common';
import { MembershipStatus } from 'src/tenant/entities/tenant-membership.entity';
import { TenantMembershipRepository } from 'src/tenant/repositories/tenant-membership.repository';
import { TenantMembershipService } from 'src/tenant/services/tenant-membership.service';
import { MyTenantDto } from '../dtos/my-tenant.dto';

@Injectable()
export class MeService {
  constructor(
    private readonly tenantMembershipService: TenantMembershipService,
  ) {}

  async getMyTenants(userId: number): Promise<MyTenantDto[]> {
    // Load memberships + tenant relation in one go
    const memberships =
      await this.tenantMembershipService.getActiveByUserWithTenant(userId);

    // Map to a UI-friendly response
    return memberships
      .filter((m) => m.status === MembershipStatus.ACTIVE) // defensive
      .map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenant.name,
        erpProvider: m.tenant.erpProvider,
        role: m.role,
        membershipId: m.id,
      }));
  }
}
