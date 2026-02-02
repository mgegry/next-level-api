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
    const payload = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    // Generate tokens
    const { accessToken, refreshToken, accessExpires, refreshExpires } =
      this.generateTokens(payload);

    // Set refresh token for the user on the database
    await this.userService.updateUser(user.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    });

    // Add cookies to the response
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
      role: user.role,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(userId: number, response: Response) {
    // Remove existen refresh token from the database
    await this.userService.updateUser(userId, {
      refreshTokenHash: null,
    });

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
    user: User,
    response: Response,
  ): Promise<RefreshResponseDto> {
    const payload = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    // Generate new tokens
    const { accessToken, refreshToken, accessExpires, refreshExpires } =
      this.generateTokens(payload);

    // Set new refresh token on the datbase
    await this.userService.updateUser(user.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    });

    // Set cookies on the response
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
  }

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

  async validateRefreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.getUserById(userId);

    if (!user) {
      this.logger.warn(
        { userId: userId },
        `User does not exist with the given id`,
      );
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (!user.refreshTokenHash) {
      this.logger.warn(
        { userId: userId },
        'User does not have a refresh token set in the database',
      );
      throw new UnauthorizedException('Invalid Credentials');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      this.logger.warn(
        { userId: userId },
        'Refresh token does not match the one in the database',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
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
