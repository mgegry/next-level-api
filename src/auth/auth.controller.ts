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
import { seconds, Throttle } from '@nestjs/throttler';

//REVIEW - Might want to add Redis for IP-based login lockouts when deploying for security

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('status')
  @UseGuards(JwtGuard)
  status(@CurrentUser() user: User) {
    // Return only safe fields (no passwordHash, no refreshTokenHash)
    // Adjust based on what your Angular needs
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

  @Post('login')
  @UseGuards(LocalGuard)
  // @Throttle({ default: { ttl: seconds(60), limit: 5 } })
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { ttl: seconds(60), limit: 30 } })
  async refreshTokens(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponseDto> {
    return this.authService.refreshTokens(user, response);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
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
