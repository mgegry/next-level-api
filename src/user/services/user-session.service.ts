import { Injectable } from '@nestjs/common';
import { UserSession } from '../entities/user-session.entity';
import {
  CreateSessionInput,
  UserSessionRepository,
} from '../repositories/user-session.repository';
import { EntityManager } from 'typeorm';

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

    if (
      session.refreshExpiresAt &&
      session.refreshExpiresAt.getTime() <= Date.now()
    ) {
      return null;
    }

    return session;
  }

  async revokeAllActiveForUser(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.userSessionRepository.revokeAllActiveForUser(userId, manager);
  }

  async createSession(
    userSession: CreateSessionInput,
    manager?: EntityManager,
  ): Promise<UserSession> {
    return this.userSessionRepository.createSession(userSession, manager);
  }

  async setRefreshTokenHash(
    sessionId: number,
    refreshTokenHash: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.userSessionRepository.setRefreshTokenHash(
      sessionId,
      refreshTokenHash,
      manager,
    );
  }

  async setCurrentTenant(
    sessionId: number,
    tenantId: number,
    manager?: EntityManager,
  ): Promise<void> {
    await this.userSessionRepository.setCurrentTenant(
      sessionId,
      tenantId,
      manager,
    );
  }

  async countActiveByTenant(
    tenantId: number,
    manager?: EntityManager,
  ): Promise<number> {
    return this.userSessionRepository.countActiveByTenant(tenantId, manager);
  }

  async updateRefreshCredentials(
    sessionId: number,
    refreshTokenHash: string,
    refreshExpiresAt: Date,
  ): Promise<void> {
    await this.userSessionRepository.updateRefreshCredentials(
      sessionId,
      refreshTokenHash,
      refreshExpiresAt,
    );
  }
}
