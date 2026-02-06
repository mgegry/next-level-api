import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'permission' })
export class Permission {
  // e.g. "invoice.read", "invoice.add"
  @PrimaryColumn({ type: 'varchar', length: 128, name: 'key' })
  key: string;

  @Column({ type: 'varchar', length: 64, name: 'category' })
  category: string; // e.g. "invoice"

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
