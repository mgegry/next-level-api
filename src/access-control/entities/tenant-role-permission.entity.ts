import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Index } from 'typeorm';
import { TenantRole } from './tenant-role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'tenant_role_permission' })
export class TenantRolePermission {
  // Composite primary key: (role_id, permission_key)

  @PrimaryColumn({ name: 'role_id', type: 'int' })
  roleId: number;

  @PrimaryColumn({ name: 'permission_key', type: 'varchar', length: 128 })
  permissionKey: string;

  @ManyToOne(() => TenantRole, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: TenantRole;

  @ManyToOne(() => Permission, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'permission_key', referencedColumnName: 'key' })
  permission: Permission;
}
