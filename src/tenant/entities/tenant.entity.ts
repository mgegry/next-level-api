import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantMembership } from '../../membership/tenant-membership.entity';

export enum ErpProvider {
  SOFTONE = 'softone',
  WME = 'wme',
}

@Entity({ name: 'tenant' })
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ErpProvider,
    name: 'erp_provider',
  })
  erpProvider: ErpProvider;

  @Column({ name: 'erp_config_encrypted', nullable: true, type: 'text' })
  erpConfigEncrypted: string;

  @Column({ name: 'max_concurrent_sessions', type: 'int', nullable: true })
  maxConcurrentSessions: number | null;

  @OneToMany(() => TenantMembership, (m) => m.tenant)
  memberships: TenantMembership[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
