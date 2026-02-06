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
import { MembershipModule } from 'src/membership/membership.module';
import { SessionCleanupService } from './services/session-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession]), MembershipModule],
  providers: [
    UserService,
    UserRepository,
    UserSessionService,
    UserSessionRepository,
    MeService,
    SessionCleanupService,
  ],
  exports: [TypeOrmModule, UserService, UserSessionService],
  controllers: [MeController],
})
export class UserModule {}
