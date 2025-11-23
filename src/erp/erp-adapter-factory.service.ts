import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { TenantService } from 'src/tenant/tenant.service';
import { IErpAdapter } from './erp.interface';
import { SoftoneAdapter } from './adapters/softone.adapter';
import { WmeAdapter } from './adapters/wme.adapter';
import { CryptoService } from 'src/core/crypto/crypto.service';

@Injectable()
export class ErpAdapterFactoryService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly http: HttpService,
    private readonly cryptoService: CryptoService,
  ) {}

  async getAdapterForTenant(tenantId: number): Promise<IErpAdapter> {
    const tenant = await this.tenantService.findOneById(tenantId);

    if (!tenant) {
      throw new Error(`Tenant with ID ${tenantId} not found`);
    }

    const erpConfig = await this.cryptoService.decrypt(
      tenant.erpConfigEncrypted,
    );

    switch (tenant.erpProvider) {
      case 'softone':
        return new SoftoneAdapter(erpConfig, this.http);
      case 'wme':
        return new WmeAdapter(erpConfig, this.http);
      default:
        throw new Error(`Unknown ERP provider: ${tenant.erpProvider}`);
    }
  }
}
