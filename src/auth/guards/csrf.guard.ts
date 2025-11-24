import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 1. Skip check for safe methods (GET, HEAD, OPTIONS)
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // 2. Get the token from the cookie (set by the middleware)
    const cookieToken = request.cookies['_csrf'];

    // 3. Get the token from the custom header (set by the client)
    const headerToken = request.headers['x-csrf-token'];

    // 4. Validate: Both must exist and match
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('CSRF token mismatch or missing.');
    }

    return true;
  }
}
