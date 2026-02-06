import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantMembership } from './tenant-membership.entity';
import { TenantMembershipService } from './tenant-membership.service';
import { TenantMembershipRepository } from './tenant-membership.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TenantMembership])],
  providers: [TenantMembershipService, TenantMembershipRepository],
  exports: [TenantMembershipService, TenantMembershipRepository],
})
export class MembershipModule {}
