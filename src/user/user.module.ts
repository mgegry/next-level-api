import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserSessionService } from './services/user-session.service';
import { UserRepository } from './repositories/user.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { UserSession } from './entities/user-session.entity';
import { MeController } from './me.controller';
import { MeService } from './services/me.service';
import { TenantModule } from 'src/tenant/tenant.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession]), TenantModule],
  providers: [
    UserService,
    UserRepository,
    UserSessionService,
    UserSessionRepository,
    MeService,
  ],
  exports: [TypeOrmModule, UserService, UserSessionService],
  controllers: [MeController],
})
export class UserModule {}
