import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErpAdapterFactoryService } from './erp-adapter-factory.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class ErpService {
  constructor(private readonly factory: ErpAdapterFactoryService) {}

  async getClients(user: User, pageNumber: number, pageSize: number) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getClients(pageNumber, pageSize);
  }

  async getItems(user: User, pageNumber: number, pageSize: number) {
    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getItems(pageNumber, pageSize);
  }
}
