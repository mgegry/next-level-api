import { Module } from '@nestjs/common';
import { ErpController } from './erp.controller';
import { TenantModule } from 'src/tenant/tenant.module';
import { CryptoModule } from 'src/core/crypto/crypto.module';
import { HttpModule } from '@nestjs/axios';
import { ErpAdapterFactoryService } from './adapters/erp-adapter-factory.service';
import { ErpService } from './erp.service';
import { SoftoneModule } from './adapters/softone/softone.module';
import { WmeModule } from './adapters/wme/wme.module';

@Module({
  imports: [TenantModule, CryptoModule, HttpModule, SoftoneModule, WmeModule],
  controllers: [ErpController],
  providers: [ErpAdapterFactoryService, ErpService],
})
export class ErpModule {}
