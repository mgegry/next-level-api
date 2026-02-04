import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAnyGuard {
  private readonly tenantGuard = new (AuthGuard('jwt-tenant'))();
  private readonly bootstrapGuard = new (AuthGuard('jwt-bootstrap'))();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try tenant first
    try {
      const ok = (await this.tenantGuard.canActivate(context)) as boolean;
      return ok;
    } catch {
      // ignore and try bootstrap
    }

    // Try bootstrap
    try {
      const ok = (await this.bootstrapGuard.canActivate(context)) as boolean;
      return ok;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
