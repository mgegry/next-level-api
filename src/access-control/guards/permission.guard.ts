import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionEvaluatorService } from '../services/permission-evaluator.service';
import {
  PERMISSION_MODE_KEY,
  PermissionMode,
  REQUIRED_PERMISSIONS_KEY,
} from '../decorators/require-permission.decorator';

type TenantAccessUser = {
  userId: number;
  email: string;
  sessionId: number;
  tenantId: number;
  membershipId: number;
  role: any;
  tokenType?: 'tenant' | 'bootstrap';
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionEvaluator: PermissionEvaluatorService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    // If nothing required, allow
    if (required.length === 0) return true;

    const mode =
      this.reflector.getAllAndOverride<PermissionMode>(PERMISSION_MODE_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? 'ALL';

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as TenantAccessUser | undefined;

    if (!user) throw new UnauthorizedException('Not authenticated');

    // If you're using tokenType separation, ensure tenant token here
    if (user.tokenType && user.tokenType !== 'tenant') {
      throw new ForbiddenException('Tenant context required');
    }

    if (!user.membershipId) {
      throw new ForbiddenException('Missing membership context');
    }

    const effective = await this.permissionEvaluator.getEffectivePermissions(
      user.membershipId,
    );

    const has = (perm: string) => effective.includes(perm);

    const ok = mode === 'ANY' ? required.some(has) : required.every(has);

    if (!ok) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
