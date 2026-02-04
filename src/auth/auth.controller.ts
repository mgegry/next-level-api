import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalGuard } from './guards/local.guard';
import { User } from 'src/user/entities/user.entity';
import type { Response } from 'express';
import { seconds, Throttle } from '@nestjs/throttler';
import { CurrentAccessUser } from './decorators/current-access-user.decorator';
import { CurrentRefreshUser } from './decorators/current-refresh-user.decorator';
import { LocalUser } from './decorators/local-user.decorator';
import type { RefreshUser } from './interfaces/refresh-user.interface';
import type { AccessUser } from './interfaces/access-user.interface';
import { SwitchTenantRequestDto } from './dtos/switch-tenant-request.dto';
import { AccessGrantedResponseDto } from './dtos/access-granted-response.dto';
import { JwtBootstrapGuard } from './guards/jwt-bootstrap.guard';
import { JwtAnyGuard } from './guards/jwt-any.guard';

//REVIEW - Might want to add Redis for IP-based login lockouts when deploying for security

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('status')
  @UseGuards(JwtAnyGuard)
  status(@CurrentAccessUser() user: AccessUser) {
    return {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      membershipId: user.membershipId,
      sessionId: user.sessionId,
    };
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @Throttle({ default: { ttl: seconds(60), limit: 5 } })
  login(
    @LocalUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessGrantedResponseDto> {
    return this.authService.login(user, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { ttl: seconds(60), limit: 30 } })
  refreshTokens(
    @CurrentRefreshUser() user: RefreshUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessGrantedResponseDto> {
    return this.authService.refreshTokens(user, response);
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  logout(
    @CurrentRefreshUser() user: RefreshUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    return this.authService.logout(user.userId, response);
  }

  @Post('switch-tenant')
  @UseGuards(JwtAnyGuard)
  switchTenant(
    @CurrentAccessUser() user: AccessUser,
    @Body() dto: SwitchTenantRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    return this.authService.switchTenantFromBootstrap(
      user,
      dto.tenantId,
      response,
    );
  }
}
