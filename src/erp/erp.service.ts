import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErpAdapterFactoryService } from './erp-adapter-factory.service';
import { Request } from 'express';

@Injectable()
export class ErpService {
  constructor(private readonly factory: ErpAdapterFactoryService) {}

  async getClients(req: Request) {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Not a valid tenantId');
    }

    const adapter = await this.factory.getAdapterForTenant(tenantId);
    return await adapter.getClients();
  }
}
