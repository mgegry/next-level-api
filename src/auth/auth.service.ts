import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { CookieOptions, Response } from 'express';
import { UserSessionService } from 'src/user/services/user-session.service';
import { TenantMembershipService } from 'src/tenant/services/tenant-membership.service';
import { TenantTokenPayload } from './interfaces/tenant-token-payload.interface';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { Request } from 'express';
import { RefreshUser } from './interfaces/refresh-user.interface';
import { AccessGrantedResponseDto } from './dtos/access-granted-response.dto';
import { DataSource } from 'typeorm';
import { TenantService } from 'src/tenant/services/tenant.service';
import { BootstrapTokenPayload } from './interfaces/bootstrap-token-payload.interface';
import { MembershipStatus } from 'src/tenant/entities/tenant-membership.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userSessionService: UserSessionService,
    private readonly tenantMembershipService: TenantMembershipService,
    private readonly tenantService: TenantService,
  ) {}

  async login(
    user: User,
    response: Response,
  ): Promise<AccessGrantedResponseDto> {
    await this.userSessionService.revokeAllActiveForUser(user.id);

    const session = await this.userSessionService.createSession({
      userId: user.id,
      currentTenantId: null,
      userAgent: null,
      deviceFingerprint: null,
    });

    const bootstrapAccessPayload = {
      typ: 'bootstrap' as const,
      sub: user.id,
      email: user.email,
      sid: session.id,
    };

    const refreshPayload = {
      sub: user.id,
      sid: session.id,
    };

    const { accessToken, refreshToken, accessExpires, refreshExpires } =
      this.generateTokens({
        accessPayload: bootstrapAccessPayload,
        refreshPayload,
      });

    await this.userSessionService.setRefreshTokenHash(
      session.id,
      await bcrypt.hash(refreshToken, 10),
    );

    const cookieOptions = this.getCookieOptions();

    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      expires: accessExpires,
      path: '/',
    });

    response.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      expires: refreshExpires,
      path: '/auth',
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: null as any,
      tenantId: null as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(userId: number, response: Response) {
    // Remove existen refresh token from the database
    await this.userSessionService.revokeAllActiveForUser(userId);

    // Clear token cookies
    const cookieOptions = this.getCookieOptions();

    response.clearCookie('access_token', {
      ...cookieOptions,
      path: '/',
    });
    response.clearCookie('refresh_token', {
      ...cookieOptions,
      path: '/auth',
    });

    response.status(200).json({ message: 'Successfully signed out' });
  }

  async refreshTokens(
    user: RefreshUser,
    response: Response,
  ): Promise<AccessGrantedResponseDto> {
    // 1) Load session
    const session = await this.userSessionService.getSessionById(
      user.sessionId,
    );
    if (
      !session ||
      !session.isActive ||
      session.revokedAt ||
      session.userId !== user.userId
    ) {
      throw new UnauthorizedException('Session invalid');
    }

    // 2) Verify refresh token matches hash stored on session
    const matches = await bcrypt.compare(
      user.refreshToken,
      session.refreshTokenHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const dbUser = await this.userService.getUserByIdOrThrow(user.userId);

    let accessPayload: any;

    if (session.currentTenantId == null) {
      // BOOTSTRAP ACCESS TOKEN (no tenant selected yet)
      accessPayload = {
        typ: 'bootstrap',
        sub: dbUser.id,
        email: dbUser.email,
        sid: session.id,
      };
    } else {
      const tenantId = session.currentTenantId;
      const membership =
        await this.tenantMembershipService.getActiveByUserAndTenant(
          user.userId,
          tenantId,
        );

      if (!membership) {
        throw new ForbiddenException('No access to tenant');
      }

      accessPayload = {
        typ: 'tenant' as const,
        sub: dbUser.id,
        email: dbUser.email,
        sid: session.id,
        tid: membership.tenantId,
        mid: membership.id,
        role: membership.role,
      };
    }

    const refreshPayload = {
      sub: dbUser.id,
      sid: session.id,
    };

    const { accessToken, refreshToken, accessExpires, refreshExpires } =
      this.generateTokens({ accessPayload, refreshPayload });

    // 5) Rotate refresh token hash on session
    await this.userSessionService.setRefreshTokenHash(
      session.id,
      await bcrypt.hash(refreshToken, 10),
    );

    // 6) Set cookies
    const cookieOptions = this.getCookieOptions();

    response.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      expires: refreshExpires,
      path: '/auth',
    });

    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      expires: accessExpires,
      path: '/',
    });

    // 7) Return DTO (role/tenant from membership, profile fields from db user)
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: accessPayload.typ === 'tenant' ? accessPayload.role : null,
      tenantId: accessPayload.typ === 'tenant' ? accessPayload.tid : null,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }

  // For Bootstrap Jwt Strategy
  async validateBootstrapAccess(payload: BootstrapTokenPayload) {
    if (!payload || payload.typ !== 'bootstrap') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = await this.userSessionService.assertSessionActive(
      payload.sid,
      payload.sub,
    );
    if (!session) throw new UnauthorizedException('Session invalid');

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
      tokenType: 'bootstrap' as const,
    };
  }

  // For Tenant Jwt Strategy
  async validateTenantAccess(payload: TenantTokenPayload) {
    if (!payload || payload.typ !== 'tenant') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = await this.userSessionService.assertSessionActive(
      payload.sid,
      payload.sub,
    );
    if (!session) throw new UnauthorizedException('Session invalid');

    const membership =
      await this.tenantMembershipService.getTenantMembershipById(payload.mid);
    if (
      !membership ||
      membership.userId !== payload.sub ||
      membership.tenantId !== payload.tid
    ) {
      throw new UnauthorizedException('Membership invalid');
    }
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new UnauthorizedException('Membership inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
      tenantId: payload.tid,
      membershipId: payload.mid,
      role: membership.role,
      tokenType: 'tenant' as const,
    };
  }

  // For Local Strategy
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      this.logger.warn({ email }, 'User not found');
      throw new UnauthorizedException(`Invalid Credentials`);
    }

    const isAuthenticated = await bcrypt.compare(password, user.passwordHash);

    if (!isAuthenticated) {
      this.logger.warn({ email }, 'Password mismatch for the given user');
      throw new UnauthorizedException(`Invalid Credentials`);
    }

    return user;
  }

  // For RefreshStrategy
  async validateRefreshContext(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const session = await this.userSessionService.assertSessionActive(
      payload.sid,
      payload.sub,
    );
    if (!session) throw new UnauthorizedException('Session invalid');

    return {
      userId: payload.sub,
      sessionId: payload.sid,
      refreshToken,
    };
  }

  async switchTenantFromBootstrap(
    bootstrapUser: { userId: number; sessionId: number; email: string },
    tenantId: number,
    response: Response,
  ) {
    // must have active membership
    const membership =
      await this.tenantMembershipService.getActiveByUserAndTenant(
        bootstrapUser.userId,
        tenantId,
      );
    if (!membership) throw new ForbiddenException('No access to this tenant');

    // transaction for seat enforcement
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const tenant = await this.tenantService.getTenantForUpdate(
        tenantId,
        qr.manager,
      );
      if (!tenant) throw new UnauthorizedException('Tenant not found');

      // enforce cap (strong count recommended)
      if (tenant.maxConcurrentSessions !== null) {
        const activeCount = await this.userSessionService.countActiveByTenant(
          tenantId,
          qr.manager,
        );
        if (activeCount >= tenant.maxConcurrentSessions) {
          throw new ForbiddenException(
            'Tenant has reached its active session limit',
          );
        }
      }

      // set current tenant on session
      await this.userSessionService.setCurrentTenant(
        bootstrapUser.sessionId,
        tenantId,
        qr.manager,
      );

      await qr.commitTransaction();
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

    // mint TENANT access token
    const accessPayload = {
      typ: 'tenant' as const,
      sub: bootstrapUser.userId,
      email: bootstrapUser.email,
      sid: bootstrapUser.sessionId,
      tid: tenantId,
      mid: membership.id,
      role: membership.role,
    };

    const { accessToken, accessExpires } =
      this.generateAccessTokenOnly(accessPayload);

    const cookieOptions = this.getCookieOptions();
    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      expires: accessExpires,
      path: '/',
    });

    return { tenantId, role: membership.role, membershipId: membership.id };
  }

  private generateAccessTokenOnly(accessPayload: any) {
    const accessExpiration = parseInt(
      this.configService.getOrThrow('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'),
    );

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: accessExpiration,
    });

    return {
      accessToken,
      accessExpires: new Date(Date.now() + accessExpiration * 1000),
    };
  }

  private getCookieOptions() {
    const isProd = this.configService.get('NODE_ENV') === 'production';

    const sameSite = isProd ? 'none' : 'lax';

    const baseOptions: CookieOptions = {
      httpOnly: true,
      sameSite: sameSite,
      secure: isProd,
    };

    return baseOptions;
  }

  private generateTokens(params: { accessPayload: any; refreshPayload: any }) {
    const accessExpiration = parseInt(
      this.configService.getOrThrow('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'),
    );
    const refreshExpiration = parseInt(
      this.configService.getOrThrow('REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC'),
    );

    const accessToken = this.jwtService.sign(params.accessPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: accessExpiration,
    });

    const refreshToken = this.jwtService.sign(params.refreshPayload, {
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
