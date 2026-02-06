import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantRoleRepository } from '../repositories/tenant-role.repository';
import { TenantRolePermissionRepository } from '../repositories/tenant-role-permission.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { TenantMembershipRepository } from 'src/membership/tenant-membership.repository';
import { PermissionCacheService } from './permission-cache.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepo: TenantRoleRepository,
    private readonly rolePermRepo: TenantRolePermissionRepository,
    private readonly permissionRepo: PermissionRepository,
    private readonly membershipRepo: TenantMembershipRepository,
    private readonly permCache: PermissionCacheService,
  ) {}

  listRoles(tenantId: number) {
    return this.roleRepo.findByTenant(tenantId);
  }

  async createRole(tenantId: number, name: string) {
    return this.roleRepo.createRole({ tenantId, name, isSystem: false });
  }

  async getRoleWithPermissions(roleId: number) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');

    const permissionKeys =
      await this.rolePermRepo.listPermissionKeysForRole(roleId);
    return { role, permissionKeys };
  }

  async replaceRolePermissions(roleId: number, permissionKeys: string[]) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem)
      throw new ForbiddenException('System role cannot be modified'); // optional

    // Validate permissions exist in catalog
    const existing = await this.permissionRepo.findByKeys(permissionKeys);
    if (existing.length !== permissionKeys.length) {
      const existingSet = new Set(existing.map((p) => p.key));
      const missing = permissionKeys.filter((k) => !existingSet.has(k));
      throw new ForbiddenException(
        `Unknown permission(s): ${missing.join(', ')}`,
      );
    }

    await this.rolePermRepo.replaceRolePermissions(roleId, permissionKeys);

    // Invalidate caches for all memberships assigned to this role
    const membershipIds =
      await this.membershipRepo.listMembershipIdsByRoleId(roleId);
    await this.permCache.invalidateManyMemberships(membershipIds);
  }
}
