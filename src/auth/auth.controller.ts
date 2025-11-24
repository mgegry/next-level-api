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
  @Throttle({ default: { ttl: seconds(60), limit: 5 } })
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
