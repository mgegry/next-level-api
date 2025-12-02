import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErpAdapterFactoryService } from './adapters/erp-adapter-factory.service';
import { User } from 'src/user/user.entity';
import { PartnersFilterRequestDto } from './dtos/request/partners-filter-request.dto';

@Injectable()
export class ErpService {
  constructor(private readonly factory: ErpAdapterFactoryService) {}

  async getPartners(
    user: User,
    pageNumber: number,
    pageSize: number,
    filters: PartnersFilterRequestDto,
  ) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getPartners(pageNumber, pageSize, filters);
  }

  async getItems(user: User, pageNumber: number, pageSize: number) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getItems(pageNumber, pageSize, null);
  }

  async getDashboard(user: User) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getDashboard();
  }
}
