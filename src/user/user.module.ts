import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserSessionService } from './services/user-session.service';
import { UserRepository } from './repositories/user.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  providers: [
    UserService,
    UserRepository,
    UserSessionService,
    UserSessionRepository,
  ],
  exports: [TypeOrmModule, UserService, UserSessionService],
})
export class UserModule {}
