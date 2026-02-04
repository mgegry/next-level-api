import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from 'src/user/entities/user.entity';

export enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  DISABLED = 'DISABLED',
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.MODERATOR]: 2,
  [Role.ADMIN]: 3,
};

@Entity({ name: 'tenant_membership' })
@Unique(['tenantId', 'userId'])
export class TenantMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tenant_id' })
  tenantId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: Role, name: 'role' })
  role: Role;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    name: 'status',
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @ManyToOne(() => Tenant, (tenant) => tenant.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
