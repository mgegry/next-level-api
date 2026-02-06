import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ): Promise<void> {
    // TODO: simplest correct approach: delete then insert (wrap in service transaction if you want)
    await this.repository.delete({ roleId });

    if (!permissionKeys.length) return;

    await this.repository.insert(
      permissionKeys.map((k) => ({
        roleId,
        permissionKey: k,
      })),
    );
  }
}
