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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
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

  @Get('test')
  @UseGuards(JwtGuard)
  async test() {
    console.log(await this.authService.test());
    return [];
  }
}
