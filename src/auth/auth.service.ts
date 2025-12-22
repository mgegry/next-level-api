import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
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

      const cookieOptions = this.getCookieOptions(isProd);

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
        role: user.role,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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

      response.clearCookie('access_token', { path: '/' });
      response.clearCookie('refresh_token', { path: '/auth/refresh' });

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

      const cookieOptions = this.getCookieOptions(isProd);

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
        path: '/auth',
      });

      response.cookie('access_token', accessToken, {
        ...cookieOptions,
        expires: accessExpires,
        path: '/',
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

  private getCookieOptions(isProd: boolean) {
    const baseOptions: CookieOptions = {
      httpOnly: true,
      sameSite: 'none',
    };

    if (isProd) {
      return {
        ...baseOptions,
        secure: true,
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
