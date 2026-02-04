import { Module } from '@nestjs/common';
import { TenantService } from './services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantMembershipService } from './services/tenant-membership.service';
import { TenantMembership } from './entities/tenant-membership.entity';
import { TenantRepository } from './repositories/tenant.repository';
import { TenantMembershipRepository } from './repositories/tenant-membership.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantMembership])],
  providers: [
    TenantService,
    TenantRepository,
    TenantMembershipService,
    TenantMembershipRepository,
  ],
  exports: [TypeOrmModule, TenantService, TenantMembershipService],
})
export class TenantModule {}
