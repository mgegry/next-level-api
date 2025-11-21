import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { CoreModule } from './core/core.module';
import { ErpModule } from './erp/erp.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CoreModule,
    UserModule,
    AuthModule,
    TenantModule,
    ErpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
