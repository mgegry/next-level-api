import { Module } from '@nestjs/common';
import { TenantService } from './services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { MembershipModule } from 'src/membership/membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), MembershipModule],
  providers: [TenantService, TenantRepository],
  exports: [TypeOrmModule, TenantService],
})
export class TenantModule {}
