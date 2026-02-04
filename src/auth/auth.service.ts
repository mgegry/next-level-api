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
import { AccessTokenPayload } from './interfaces/access-token-payload.interface';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { Request } from 'express';
import { AccessUser } from './interfaces/access-user.interface';
import { RefreshUser } from './interfaces/refresh-user.interface';
import { AccessGrantedResponseDto } from './dtos/access-granted-response.dto';
import { DataSource } from 'typeorm';
import { TenantService } from 'src/tenant/services/tenant.service';

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
    // 1) Get active memberships
    const memberships =
      await this.tenantMembershipService.getActiveByUserWithTenant(user.id);

    if (!memberships.length) {
      throw new ForbiddenException('User has no active tenants');
    }

    // 2) Choose a default membership (simple: first)
    // Better later: choose last-used tenant, or admin-first.
    const membership = memberships[0];
    const tenantId = membership.tenantId;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1) lock tenant row
      const tenant = await this.tenantService.getTenantForUpdate(
        tenantId,
        queryRunner.manager,
      );
      if (!tenant) throw new UnauthorizedException('Tenant not found');

      // 2) single device per user
      await this.userSessionService.revokeAllActiveForUser(
        user.id,
        queryRunner.manager,
      );

      // 3) enforce session cap (NULL = unlimited)
      if (tenant.maxConcurrentSessions !== null) {
        const activeCount = await this.userSessionService.countActiveByTenant(
          tenantId,
          queryRunner.manager,
        );

        if (activeCount >= tenant.maxConcurrentSessions) {
          throw new ForbiddenException(
            'Tenant has reached its active session limit',
          );
        }
      }

      // 4) create session
      const session = await this.userSessionService.createSession(
        {
          userId: user.id,
          currentTenantId: tenantId,
          userAgent: null,
          deviceFingerprint: null,
        },
        queryRunner.manager,
      );

      // 5) generate tokens
      const accessPayload: AccessTokenPayload = {
        sub: user.id,
        email: user.email,
        sid: session.id,
        tid: membership.tenantId,
        mid: membership.id,
        role: membership.role,
      };

      const refreshPayload: RefreshTokenPayload = {
        sub: user.id,
        sid: session.id,
      };

      const { accessToken, refreshToken, accessExpires, refreshExpires } =
        this.generateTokens({ accessPayload, refreshPayload });

      // 6) store refresh hash on same session row
      await this.userSessionService.setRefreshTokenHash(
        session.id,
        await bcrypt.hash(refreshToken, 10),
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

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

      const tenants = memberships.map((m) => ({
        id: m.tenantId,
        name: m.tenant?.name ?? '', // because relations loaded
        role: m.role,
      }));

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: membership.role,
        tenantId: membership.tenantId,
        tenants: tenants,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }

    // // 3) Enforce "one instance": revoke existing active sessions
    // await this.userSessionService.revokeAllActiveForUser(user.id);

    // const session = await this.userSessionService.createSession({
    //   userId: user.id,
    //   currentTenantId: membership.tenantId,
    //   userAgent: null,
    //   deviceFingerprint: null,
    // });

    // const accessPayload: AccessTokenPayload = {
    //   sub: user.id,
    //   email: user.email,
    //   sid: session.id,
    //   tid: membership.tenantId,
    //   mid: membership.id,
    //   role: membership.role,
    // };

    // const refreshPayload: RefreshTokenPayload = {
    //   sub: user.id,
    //   sid: session.id,
    // };

    // Generate tokens
    // const { accessToken, refreshToken, accessExpires, refreshExpires } =
    //   this.generateTokens({ accessPayload, refreshPayload });

    // 6) Store refresh token hash on the session row
    // await this.userSessionService.setRefreshTokenHash(
    //   session.id,
    //   await bcrypt.hash(refreshToken, 10),
    // );

    // Add cookies to the response
    // const cookieOptions = this.getCookieOptions();

    // response.cookie('access_token', accessToken, {
    //   ...cookieOptions,
    //   expires: accessExpires,
    //   path: '/',
    // });

    // response.cookie('refresh_token', refreshToken, {
    //   ...cookieOptions,
    //   expires: refreshExpires,
    //   path: '/auth',
    // });

    // const tenants = memberships.map((m) => ({
    //   id: m.tenantId,
    //   name: m.tenant?.name ?? '', // because relations loaded
    //   role: m.role,
    // }));

    // return {
    //   id: user.id,
    //   email: user.email,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   role: membership.role,
    //   tenantId: membership.tenantId,
    //   tenants: tenants,
    //   createdAt: user.createdAt,
    //   updatedAt: user.updatedAt,
    // };
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

    // 3) Determine tenant context from session
    const tenantId = session.currentTenantId;
    const membership =
      await this.tenantMembershipService.getActiveByUserAndTenant(
        user.userId,
        tenantId,
      );

    if (!membership) {
      throw new ForbiddenException('No access to tenant');
    }

    // 4) Mint new tokens
    const dbUser = await this.userService.getUserByIdOrThrow(user.userId);

    const accessPayload = {
      sub: dbUser.id,
      email: dbUser.email,
      sid: session.id,
      tid: membership.tenantId,
      mid: membership.id,
      role: membership.role,
    };

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

    const tenantMemberships =
      await this.tenantMembershipService.getActiveByUserWithTenant(dbUser.id);

    const tenants = tenantMemberships.map((m) => ({
      id: m.tenantId,
      name: m.tenant?.name ?? '', // because relations loaded
      role: m.role,
    }));

    // 7) Return DTO (role/tenant from membership, profile fields from db user)
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: membership.role,
      tenantId: membership.tenantId,
      tenants: tenants,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
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

  // For Jwt Strategy
  async validateAccessContext(payload: AccessTokenPayload) {
    const session = await this.userSessionService.assertSessionActive(
      payload.sid,
      payload.sub,
    );
    if (!session) throw new UnauthorizedException('Session invalid');

    const membership =
      await this.tenantMembershipService.assertMembershipActive({
        membershipId: payload.mid,
        userId: payload.sub,
        tenantId: payload.tid,
      });
    if (!membership) throw new UnauthorizedException('Membership invalid');

    return {
      userId: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
      tenantId: payload.tid,
      membershipId: payload.mid,
      role: membership.role, // source of truth
    };
  }

  // For RefreshStrategy
  async validateRefreshContext(req: Request, payload: RefreshTokenPayload) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    // optional: fail fast if session revoked
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

  async switchTenant(
    accessUser: AccessUser,
    targetTenantId: number,
    response: Response,
  ): Promise<AccessGrantedResponseDto> {
    // 1) Verify the user has ACTIVE membership in requested tenant
    const membership =
      await this.tenantMembershipService.getActiveByUserAndTenant(
        accessUser.userId,
        targetTenantId,
      );

    if (!membership) {
      throw new ForbiddenException('No access to this tenant');
    }

    // 2) Optional but recommended: ensure session is still valid/active
    const session = await this.userSessionService.getSessionById(
      accessUser.sessionId,
    );
    if (
      !session ||
      !session.isActive ||
      session.revokedAt ||
      session.userId !== accessUser.userId
    ) {
      throw new UnauthorizedException('Session invalid');
    }

    // 3) Update session tenant context (so refresh knows which tenant to mint access for)
    await this.userSessionService.setCurrentTenant(
      accessUser.sessionId,
      targetTenantId,
    );

    // 4) Load user profile if you want to return firstName/lastName/etc
    const dbUser = await this.userService.getUserByIdOrThrow(accessUser.userId);

    // 5) Mint NEW access token (tenant-scoped) using SAME session id
    const accessPayload: AccessTokenPayload = {
      sub: dbUser.id,
      email: dbUser.email,
      sid: accessUser.sessionId,
      tid: membership.tenantId,
      mid: membership.id,
      role: membership.role,
    };

    // We do NOT need a new refresh token on switch
    const { accessToken, accessExpires } =
      this.generateAccessTokenOnly(accessPayload);

    // 6) Set access cookie
    const cookieOptions = this.getCookieOptions();
    response.cookie('access_token', accessToken, {
      ...cookieOptions,
      expires: accessExpires,
      path: '/',
    });

    const tenantMemberships =
      await this.tenantMembershipService.getActiveByUserWithTenant(dbUser.id);

    const tenants = tenantMemberships.map((m) => ({
      id: m.tenantId,
      name: m.tenant?.name ?? '', // because relations loaded
      role: m.role,
    }));

    // 7) Return something useful to frontend
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: membership.role,
      tenantId: membership.tenantId,
      tenants: tenants,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }

  private generateAccessTokenOnly(accessPayload: AccessTokenPayload) {
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

  private generateTokens(params: {
    accessPayload: AccessTokenPayload;
    refreshPayload: RefreshTokenPayload;
  }) {
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
