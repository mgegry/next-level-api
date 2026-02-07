import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentAccessUser } from 'src/auth/decorators/current-access-user.decorator';
import { JwtTenantGuard } from 'src/auth/guards/jwt-tenant.guard';
import type { AccessUser } from 'src/auth/interfaces/access-user.interface';
import { RoleService } from './services/role.service';

@Controller('access/:tenantId/roles')
export class AccessController {
  constructor(private readonly roleService: RoleService) {}

  @Put(':roleId/permissions')
  @UseGuards(JwtTenantGuard)
  // @RequirePermission('roles.manage')
  replacePermissions(
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: any,
    @CurrentAccessUser() user: AccessUser,
  ) {
    this.assertTenantMatch(tenantId, user);
    return this.roleService.replaceRolePermissions(roleId, dto.permissions);
  }

  // @Delete(':roleId')
  // // @RequirePermission('roles.manage')
  // delete(
  //   @Param('tenantId', ParseIntPipe) tenantId: number,
  //   @Param('roleId', ParseIntPipe) roleId: number,
  //   @CurrentAccessUser() user: AccessUser,
  // ) {
  //   this.assertTenantMatch(tenantId, user);
  //   return this.roleService.deleteRole(roleId); // implement in service if not present
  // }

  private assertTenantMatch(routeTenantId: number, user: AccessUser) {
    if (user.tenantId !== routeTenantId) {
      throw new ForbiddenException('Tenant mismatch');
    }
  }
}
