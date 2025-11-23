import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { JwtGuard } from './guards/jwt.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  @ApiCreatedResponse({ type: LoginResponseDto })
  async login(@Request() req): Promise<LoginResponseDto | BadRequestException> {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Request() req) {
    return this.authService.refreshTokens(req.user);
  }
}
