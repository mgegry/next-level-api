import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantRoleRepository } from '../repositories/tenant-role.repository';
import { TenantMembershipRepository } from 'src/membership/tenant-membership.repository';
import { PermissionCacheService } from './permission-cache.service';

@Injectable()
export class MembershipRoleService {
  constructor(
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly roleRepo: TenantRoleRepository,
    private readonly permCache: PermissionCacheService,
  ) {}

  async assignRoleToMembership(membershipId: number, roleId: number | null) {
    const membership = await this.membershipRepo.findById(membershipId);
    if (!membership) throw new NotFoundException('Membership not found');

    if (roleId !== null) {
      const role = await this.roleRepo.findById(roleId);
      if (!role) throw new NotFoundException('Role not found');
      if (role.tenantId !== membership.tenantId) {
        throw new NotFoundException('Role does not belong to this tenant');
      }
    }

    await this.membershipRepo.assignRole(membershipId, roleId);
    await this.permCache.invalidateMembership(membershipId);
  }
}
