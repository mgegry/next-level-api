import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ErpType } from './erp-type.enum';
import { User } from 'src/user/user.entity';

@Entity({ name: 'tenant' })
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ErpType,
    name: 'erp_provider',
  })
  erpProvider: ErpType;

  @Column({ name: 'erp_config_encrypted', nullable: true })
  erpConfigEncrypted: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
