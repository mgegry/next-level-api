import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfCookieMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // The cookie name should match what the client reads
    const cookieName = '_csrf';

    // 1. Check if the CSRF cookie exists
    let csrfToken = req.cookies[cookieName];

    if (!csrfToken) {
      // 2. If missing, generate a new token
      csrfToken = crypto.randomUUID();

      const isProd = this.configService.get('NODE_ENV') === 'production';
      const domain = this.configService.get('COOKIE_DOMAIN');

      // 3. Set the new cookie with client-readable properties
      res.cookie(cookieName, csrfToken, {
        // Must NOT be httpOnly so Angular can read it
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        domain: isProd ? domain : undefined,
      });
    }

    // 4. Store the token on the request object for the next middleware/guard to check
    req.csrfToken = csrfToken;

    next();
  }
}
