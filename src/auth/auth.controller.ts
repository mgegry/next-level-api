import { Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshResponseDto } from './dtos/refresh-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@CurrentUser() user: User): Promise<LoginResponseDto> {
    return this.authService.login(user);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@CurrentUser() user: User): Promise<RefreshResponseDto> {
    return this.authService.refreshTokens(user);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async logout(@CurrentUser() user: User): Promise<void> {
    await this.authService.logout(user.id);
  }
}
