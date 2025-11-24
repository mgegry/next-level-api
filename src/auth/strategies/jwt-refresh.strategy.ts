import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AccessTokenPayload } from '../dtos/access-token-payload.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
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
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new ForbiddenException('Missing refresh token');
    }

    const user = await this.authService.validateRefreshTokens(
      payload.id,
      refreshToken,
    );

    if (!user) {
      throw new UnauthorizedException('Refresh token hash validation failed');
    }
    return user;
  }
}
