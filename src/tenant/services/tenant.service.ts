import { Injectable } from '@nestjs/common';
import { TenantRepository } from '../repositories/tenant.repository';

@Injectable()
export class TenantService {
  constructor(private readonly tenantRepository: TenantRepository) {}

  getTenantById(tenantId: number) {
    return this.tenantRepository.findOneById(tenantId);
  }
}
