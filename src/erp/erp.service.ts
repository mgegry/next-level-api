import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErpAdapterFactoryService } from './adapters/erp-adapter-factory.service';
import { User } from 'src/user/user.entity';
import { PartnersFilterRequestDto } from './dtos/request/partners-filter-request.dto';
import { ItemsFilterRequestDto } from './dtos/request/items-filter-request.dto';
import { PaginatedRequestDto } from './dtos/request/paginated-request.dto';

@Injectable()
export class ErpService {
  constructor(private readonly factory: ErpAdapterFactoryService) {}

  async getPartners(
    user: User,
    pagination: PaginatedRequestDto,
    filters: PartnersFilterRequestDto,
  ) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getPartners(pagination, filters);
  }

  async getItems(
    user: User,
    pagination: PaginatedRequestDto,
    filters: ItemsFilterRequestDto,
  ) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getItems(pagination, filters);
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
