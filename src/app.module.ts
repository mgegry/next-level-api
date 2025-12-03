import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { CoreModule } from './core/core.module';
import { ErpModule } from './erp/erp.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WmeModule } from './wme/wme.module';
import { SoftoneModule } from './softone/softone.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`config/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      //REVIEW - If revers proxy is used this has to be changed according to the documentation
      // https://docs.nestjs.com/security/rate-limiting
      throttlers: [
        {
          ttl: seconds(60),
          limit: 20,
        },
      ],
    }),
    CoreModule,
    UserModule,
    AuthModule,
    TenantModule,
    ErpModule,
    WmeModule,
    SoftoneModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
