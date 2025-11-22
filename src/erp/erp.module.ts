import { Module } from '@nestjs/common';
import { ErpController } from './erp.controller';
import { TenantModule } from 'src/tenant/tenant.module';
import { CryptoModule } from 'src/core/crypto/crypto.module';
import { HttpModule } from '@nestjs/axios';
import { ErpAdapterFactoryService } from './erp-adapter-factory.service';
import { ErpService } from './erp.service';

@Module({
  imports: [TenantModule, CryptoModule, HttpModule],
  controllers: [ErpController],
  providers: [ErpAdapterFactoryService, ErpService],
})
export class ErpModule {}
