import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { TenantRolePermission } from './entities/tenant-role-permission.entity';
import { TenantRole } from './entities/tenant-role.entity';
import { TenantMembership } from 'src/membership/tenant-membership.entity';
import { PermissionRepository } from './repositories/permission.repository';
import { TenantRoleRepository } from './repositories/tenant-role.repository';
import { TenantRolePermissionRepository } from './repositories/tenant-role-permission.repository';
import { MembershipModule } from 'src/membership/membership.module';
import { RedisModule } from 'src/core/redis/redis.module';
import { MembershipRoleService } from './services/membership-role.service';
import { PermissionCacheService } from './services/permission-cache.service';
import { PermissionEvaluatorService } from './services/permission-evaluator.service';
import { RoleService } from './services/role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      TenantRolePermission,
      TenantRole,
      TenantMembership,
    ]),
    MembershipModule,
    RedisModule,
  ],
  providers: [
    PermissionRepository,
    TenantRoleRepository,
    TenantRolePermissionRepository,
    MembershipRoleService,
    PermissionCacheService,
    PermissionCacheService,
    PermissionEvaluatorService,
    RoleService,
  ],
  exports: [PermissionEvaluatorService],
})
export class AccessControlModule {}
