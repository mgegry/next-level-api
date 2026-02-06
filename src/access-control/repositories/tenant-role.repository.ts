import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantRole } from '../entities/tenant-role.entity';

@Injectable()
export class TenantRoleRepository {
  constructor(
    @InjectRepository(TenantRole)
    private readonly repository: Repository<TenantRole>,
  ) {}

  async findById(roleId: number): Promise<TenantRole | null> {
    return this.repository.findOne({ where: { id: roleId } });
  }

  async findByTenant(tenantId: number): Promise<TenantRole[]> {
    return this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async createRole(input: {
    tenantId: number;
    name: string;
    isSystem?: boolean;
  }): Promise<TenantRole> {
    const role = this.repository.create({
      tenantId: input.tenantId,
      name: input.name,
      isSystem: input.isSystem ?? false,
    });
    return this.repository.save(role);
  }

  async updateRole(roleId: number, patch: Partial<TenantRole>): Promise<void> {
    await this.repository.update({ id: roleId }, patch);
  }

  async deleteRole(roleId: number): Promise<void> {
    await this.repository.delete({ id: roleId });
  }
}
