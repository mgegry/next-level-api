import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantRolePermissionRepository } from '../repositories/tenant-role-permission.repository';
import { PermissionCacheService } from './permission-cache.service';
import { TenantMembershipRepository } from 'src/membership/tenant-membership.repository';

@Injectable()
export class PermissionEvaluatorService {
  constructor(
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly rolePermRepo: TenantRolePermissionRepository,
    private readonly cache: PermissionCacheService,
  ) {}

  async getEffectivePermissions(membershipId: number): Promise<string[]> {
    const membership = await this.membershipRepo.findById(membershipId);
    if (!membership) throw new NotFoundException('Membership not found');

    const cached = await this.cache.get(
      membershipId,
      membership.permissionVersion,
    );
    if (cached) return cached;

    if (!membership.roleId) {
      await this.cache.set(membershipId, membership.permissionVersion, []);
      return [];
    }

    const keys = await this.rolePermRepo.listPermissionKeysForRole(
      membership.roleId,
    );
    await this.cache.set(membershipId, membership.permissionVersion, keys);
    return keys;
  }

  async hasPermission(
    membershipId: number,
    permissionKey: string,
  ): Promise<boolean> {
    const perms = await this.getEffectivePermissions(membershipId);
    return perms.includes(permissionKey);
  }
}
