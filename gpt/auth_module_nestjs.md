# Auth Module NestJS

- "auth.controller.ts"

import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshResponseDto } from './dtos/refresh-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/user/user.entity';
import type { Response } from 'express';
import { CsrfGuard } from './guards/csrf.guard';
import { seconds, Throttle } from '@nestjs/throttler';

//REVIEW - Might want to add Redis for IP-based login lockouts when deploying for security

@Controller('auth')
export class AuthController {
constructor(private authService: AuthService) {}

@Post('login')
@UseGuards(LocalGuard, CsrfGuard)
@Throttle({ default: { ttl: seconds(60), limit: 5 } })
async login(
@CurrentUser() user: User,
@Res({ passthrough: true }) response: Response,
): Promise<LoginResponseDto> {
return this.authService.login(user, response);
}

@Post('refresh')
@UseGuards(JwtRefreshGuard, CsrfGuard)
@Throttle({ default: { ttl: seconds(60), limit: 30 } })
async refreshTokens(
@CurrentUser() user: User,
@Res({ passthrough: true }) response: Response,
): Promise<RefreshResponseDto> {
return this.authService.refreshTokens(user, response);
}

@Post('logout')
@UseGuards(JwtGuard, CsrfGuard)
async logout(
@CurrentUser() user: User,
@Res({ passthrough: true }) response: Response,
): Promise<void> {
await this.authService.logout(user.id, response);
}

@Get('csrf-token')
async getCsrfToken(): Promise<void> {
return;
}
}

- "auth.module.ts"

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { CsrfCookieMiddleware } from '../core/middleware/csrf-cookie-middleware';

@Module({
imports: [UserModule, JwtModule],
providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
controllers: [AuthController],
exports: [AuthService, JwtModule],
})
export class AuthModule implements NestModule {
configure(consumer: MiddlewareConsumer) {
consumer.apply(CsrfCookieMiddleware).forRoutes('\*');
}
}

- "auth.service.ts"

import {
ForbiddenException,
Injectable,
Logger,
UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import \* as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { CookieOptions, Response } from 'express';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshResponseDto } from './dtos/refresh-response.dto';

@Injectable()
export class AuthService {
private readonly logger = new Logger(AuthService.name);

constructor(
private readonly userService: UserService,
private readonly jwtService: JwtService,
private readonly configService: ConfigService,
) {}

async login(user: User, response: Response): Promise<LoginResponseDto> {
try {
const isProd = this.configService.get('NODE_ENV') === 'production';
const domain = this.configService.get('COOKIE_DOMAIN');

      const cookieOptions = this.getCookieOptions(isProd, domain);

      const payload = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      };

      const { accessToken, refreshToken, accessExpires, refreshExpires } =
        this.generateTokens(payload);

      await this.userService.updateUser(user.id, {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      });

      response.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        expires: refreshExpires,
        path: '/auth/refresh',
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken: accessToken,
        accessExpires: accessExpires.toISOString(),
      };
    } catch (error) {
      this.logger.error('Login error:', {
        error: error.message,
        userId: user.id,
        stack: error.stack,
      });

      throw new UnauthorizedException(
        'Failed to process login. Please try again.',
      );
    }

}

async logout(userId: number, response: Response) {
try {
await this.userService.updateUser(userId, {
refreshTokenHash: null,
});

      response.clearCookie('access_token');
      response.clearCookie('refresh_token');

      response.status(200).json({ message: 'Successfully signed out' });
    } catch (error) {
      this.logger.error('Sign out error:', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      throw new UnauthorizedException('Failed to process sign out');
    }

}

async refreshTokens(
user: User,
response: Response,
): Promise<RefreshResponseDto> {
try {
const isProd = this.configService.get('NODE_ENV') === 'production';
const domain = this.configService.get('COOKIE_DOMAIN');

      const cookieOptions = this.getCookieOptions(isProd, domain);

      const payload = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      };

      const { accessToken, refreshToken, accessExpires, refreshExpires } =
        this.generateTokens(payload);

      await this.userService.updateUser(user.id, {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      });

      response.cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        expires: refreshExpires,
        path: '/auth/refresh',
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken: accessToken,
        accessExpires: accessExpires.toISOString(),
      };
    } catch (error) {
      this.logger.error('Refresh tokens error:', {
        error: error.message,
        userId: user.id,
        stack: error.stack,
      });

      throw new UnauthorizedException(
        'Failed to refresh tokens. Please try again.',
      );
    }

}

async validateUser(email: string, password: string): Promise<any> {
try {
const user = await this.userService.getUserByEmail(email);

      if (!user) {
        throw new UnauthorizedException(`User not found: ${email}`);
      }

      const isAuthenticated = await bcrypt.compare(password, user.passwordHash);

      if (!isAuthenticated) {
        throw new UnauthorizedException(`Password mismatch for user: ${email}`);
      }

      return user;
    } catch (error) {
      this.logger.error('Auth error', error);

      throw new UnauthorizedException('Invalid credentials');
    }

}

async validateRefreshTokens(userId: number, refreshToken: string) {
try {
const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('User is logged out');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!refreshTokenMatches) {
        throw new ForbiddenException('Invalid refresh token');
      }

      return user;
    } catch (error) {
      this.logger.error('Verify user refresh token error', error);
      throw new ForbiddenException('Access Denied');
    }

}

private getCookieOptions(isProd: boolean, domain: string) {
const baseOptions: CookieOptions = {
httpOnly: true,
sameSite: 'lax',
};

    if (isProd) {
      return {
        ...baseOptions,
        secure: true,
        domain,
      };
    }

    return {
      ...baseOptions,
      secure: false,
    };

}

private generateTokens(payload: any) {
const accessExpiration = parseInt(
this.configService.getOrThrow('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'),
);
const refreshExpiration = parseInt(
this.configService.getOrThrow('REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC'),
);

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: accessExpiration,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiration,
    });

    return {
      accessToken,
      refreshToken,
      accessExpires: new Date(Date.now() + accessExpiration * 1000),
      refreshExpires: new Date(Date.now() + refreshExpiration * 1000),
    };

}
}

## Folders inside auth module

### Decorators

- current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentUserByContext = (context: ExecutionContext) =>
context.switchToHttp().getRequest().user;

export const CurrentUser = createParamDecorator(
(\_data: unknown, context: ExecutionContext) =>
getCurrentUserByContext(context),
);

### Dtos

- access-token-payload.dto.ts

import { Role } from 'src/user/role.enum';

export interface AccessTokenPayload {
id: number;
email: string;
tenantId: string;
role: Role;
}

- login-response.dto.ts

export class LoginResponseDto {
id: number;
email: string;
firstName: string;
lastName: string;
role: string;
tenantId: number;
updatedAt: Date;
createdAt: Date;
accessToken: string;
accessExpires: string;
}

- refresh-response.dto.ts

export interface RefreshResponseDto {
id: number;
email: string;
firstName: string;
lastName: string;
role: string;
tenantId: number;
createdAt: Date;
updatedAt: Date;
accessToken: string;
accessExpires: string;
}

### Guards

- "csrf.guard.ts"

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

- "jwt-refresh.guard.ts"

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}

- "jwt.guard.ts"

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}

- "local.guard.ts"

import { AuthGuard } from '@nestjs/passport';

export class LocalGuard extends AuthGuard('local') {}

### Strategies

- "jwt-refresh.strategy.ts"

import {
ForbiddenException,
Injectable,
Logger,
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

- "jwt.strategy.ts"

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AccessTokenPayload } from '../dtos/access-token-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
constructor(private readonly configService: ConfigService) {
super({
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
ignoreExpiration: false,
secretOrKey: configService.get('JWT_SECRET'),
});
}

async validate(payload: AccessTokenPayload) {
return payload;
}
}

- "local.strategy.ts"

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
constructor(private authService: AuthService) {
super({
usernameField: 'email',
});
}

async validate(email: string, password: string): Promise<User> {
const user = await this.authService.validateUser(email, password);
if (!user) {
throw new UnauthorizedException();
}
return user;
}
}
