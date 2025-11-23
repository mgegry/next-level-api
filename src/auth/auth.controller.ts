import { Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshResponseDto } from './dtos/refresh-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Request() req): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Request() req): Promise<RefreshResponseDto> {
    return this.authService.refreshTokens(req.user);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async logout(@Request() req): Promise<void> {
    await this.authService.logout(req.user.id);
  }
}
