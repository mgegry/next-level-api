import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AccessTokenPayload } from '../interfaces/access-token-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.refresh_token,
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: AccessTokenPayload) {
    // const refreshToken = request.cookies['refresh_token'];

    // if (!refreshToken) {
    //   this.logger.warn('Refresh token missing from request');
    //   throw new UnauthorizedException('Invalid Credentials');
    // }

    // return this.authService.validateRefreshTokens(payload.id, refreshToken);
    return this.authService.validateRefreshContext(request, payload);
  }
}
