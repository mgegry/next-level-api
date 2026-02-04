import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtTenantStrategy } from './strategies/jwt-tenant.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { TenantModule } from 'src/tenant/tenant.module';
import { JwtBootstrapStrategy } from './strategies/jwt-bootstrap.strategy';

@Module({
  imports: [UserModule, TenantModule, JwtModule],
  providers: [
    AuthService,
    LocalStrategy,
    JwtTenantStrategy,
    JwtRefreshStrategy,
    JwtBootstrapStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
