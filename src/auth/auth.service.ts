import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { AccessToken } from './types/access-token.type';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(user: User): Promise<AccessToken> {
    try {
      const refreshExpirationSec = parseInt(
        this.configService.getOrThrow('REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC'),
      );

      const payload = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpirationSec,
      });

      await this.userService.updateUser(user.id, {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      });

      return { accessToken: accessToken, refreshToken: refreshToken };
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

  async logout(userId: number) {
    try {
      await this.userService.updateUser(userId, {
        refreshTokenHash: null,
      });
    } catch (error) {
      this.logger.error('Sign out error:', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      throw new UnauthorizedException('Failed to process sign out');
    }
  }

  async refreshTokens(user: User) {
    try {
      const refreshExpirationSec = parseInt(
        this.configService.getOrThrow('REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC'),
      );

      const payload = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpirationSec,
      });

      await this.userService.updateUser(user.id, {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      });
      return { accessToken: accessToken, refreshToken: refreshToken };
    } catch (error) {
      this.logger.error('Refresh tokens error:', {
        error: error.message,
        user: user.id,
        stack: error.stack,
      });

      throw new UnauthorizedException('Failed to refresh tokens');
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
}
