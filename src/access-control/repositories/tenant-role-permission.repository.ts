import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TenantRolePermission } from '../entities/tenant-role-permission.entity';

@Injectable()
export class TenantRolePermissionRepository {
  constructor(
    @InjectRepository(TenantRolePermission)
    private readonly repository: Repository<TenantRolePermission>,
  ) {}

  async listPermissionKeysForRole(roleId: number): Promise<string[]> {
    const rows = await this.repository.find({
      where: { roleId },
      select: { permissionKey: true, roleId: true },
      order: { permissionKey: 'ASC' },
    });
    return rows.map((r) => r.permissionKey);
  }

  async replaceRolePermissions(
    roleId: number,
    permissionKeys: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.repository.manager;

    await em.delete(TenantRolePermission, { roleId });

    const uniqueKeys = Array.from(new Set(permissionKeys));
    if (!uniqueKeys.length) return;

    await em.insert(
      TenantRolePermission,
      uniqueKeys.map((permissionKey) => ({ roleId, permissionKey })),
    );
  }
}
