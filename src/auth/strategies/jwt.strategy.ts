import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AccessTokenPayload } from '../interfaces/access-token-payload.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.access_token,
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessTokenPayload) {
    // return payload; // OLD
    return this.authService.validateAccessContext(payload);
  }
}
