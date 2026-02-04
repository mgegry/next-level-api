import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly repository: Repository<Tenant>,
  ) {}

  async findOneById(tenantId: number): Promise<Tenant | null> {
    return this.repository.findOneBy({ id: tenantId });
  }

  async findByIdForUpdate(
    tenantId: number,
    manager: EntityManager,
  ): Promise<Tenant | null> {
    return manager
      .createQueryBuilder(Tenant, 't')
      .setLock('pessimistic_write') // FOR UPDATE
      .where('t.id = :tenantId', { tenantId })
      .getOne();
  }
}
