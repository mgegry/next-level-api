import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from '../entities/user-session.entity';
import { IsNull, Repository } from 'typeorm';

export interface CreateSessionInput {
  userId: number;
  currentTenantId: number;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
}

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly repository: Repository<UserSession>,
  ) {}

  async findById(sessionId: number): Promise<UserSession | null> {
    return this.repository.findOne({ where: { id: sessionId } });
  }

  async findActiveByUserId(userId: number): Promise<UserSession | null> {
    return this.repository.findOne({
      where: { userId, isActive: true, revokedAt: IsNull() },
      order: { id: 'DESC' },
    });
  }

  /**
   * Enforce single device/session: revoke all active sessions for the user.
   */
  async revokeAllActiveForUser(userId: number): Promise<void> {
    await this.repository.update(
      { userId, isActive: true, revokedAt: IsNull() },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async createSession(userSession: CreateSessionInput): Promise<UserSession> {
    const session = this.repository.create({
      userId: userSession.userId,
      currentTenantId: userSession.currentTenantId,
      userAgent: userSession.userAgent ?? null,
      deviceFingerprint: userSession.deviceFingerprint ?? null,
      isActive: true,
      revokedAt: null,
      lastSeenAt: null,
    });

    return this.repository.save(session);
  }

  async setRefreshTokenHash(
    sessionId: number,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.repository.update({ id: sessionId }, { refreshTokenHash });
  }

  async setCurrentTenant(sessionId: number, tenantId: number): Promise<void> {
    await this.repository.update(
      { id: sessionId, isActive: true, revokedAt: IsNull() },
      { currentTenantId: tenantId },
    );
  }

  async touchLastSeen(sessionId: number): Promise<void> {
    await this.repository.update(
      { id: sessionId, isActive: true, revokedAt: IsNull() },
      { lastSeenAt: new Date() },
    );
  }
}
