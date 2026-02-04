import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly repository: Repository<Tenant>,
  ) {}

  async findOneById(tenantId: number): Promise<Tenant | null> {
    return this.repository.findOneBy({ id: tenantId });
  }
}
