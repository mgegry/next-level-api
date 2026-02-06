import { Tenant } from 'src/tenant/entities/tenant.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { TenantRolePermission } from './tenant-role-permission.entity';

@Entity({ name: 'tenant_role' })
@Unique(['tenantId', 'name'])
export class TenantRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 64 })
  name: string; // e.g. "Admin", "Accounting"

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @OneToMany(() => TenantRolePermission, (rp) => rp.role)
  rolePermissions: TenantRolePermission[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
