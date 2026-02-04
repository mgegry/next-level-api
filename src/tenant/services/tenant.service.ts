import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../repositories/tenant.repository';
import { EntityManager } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  getTenantById(tenantId: number) {
    return this.tenantRepository.findOneById(tenantId);
  }

  async getTenantForUpdate(
    tenantId: number,
    manager: EntityManager,
  ): Promise<Tenant | null> {
    return this.tenantRepository.findByIdForUpdate(tenantId, manager);
  }
}
