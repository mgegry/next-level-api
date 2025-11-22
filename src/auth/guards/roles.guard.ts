import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Role, RoleHierarchy } from 'src/user/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // no roles required
    }

    const { user } = context.switchToHttp().getRequest();

    const userRoleRank = RoleHierarchy[user.role];

    // Check if user is equal or higher rank than any required role
    return requiredRoles.some((role) => userRoleRank >= RoleHierarchy[role]);
  }
}
