import { Injectable } from '@nestjs/common';
import { UserSession } from '../entities/user-session.entity';
import {
  CreateSessionInput,
  UserSessionRepository,
} from '../repositories/user-session.repository';

@Injectable()
export class UserSessionService {
  constructor(private readonly userSessionRepository: UserSessionRepository) {}

  async getSessionById(id: number): Promise<UserSession | null> {
    return this.userSessionRepository.findById(id);
  }

  async assertSessionActive(
    sessionId: number,
    userId: number,
  ): Promise<UserSession | null> {
    const session = await this.userSessionRepository.findById(sessionId);
    if (!session) return null;
    if (!session.isActive || session.revokedAt) return null;
    if (session.userId !== userId) return null;
    return session;
  }

  async revokeAllActiveForUser(userId: number): Promise<void> {
    await this.userSessionRepository.revokeAllActiveForUser(userId);
  }

  async createSession(userSession: CreateSessionInput): Promise<UserSession> {
    return this.userSessionRepository.createSession(userSession);
  }

  async setRefreshTokenHash(
    sessionId: number,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.userSessionRepository.setRefreshTokenHash(
      sessionId,
      refreshTokenHash,
    );
  }
}
