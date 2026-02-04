import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from '../entities/user-session.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';
import {
  MembershipStatus,
  TenantMembership,
} from 'src/tenant/entities/tenant-membership.entity';

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
  async revokeAllActiveForUser(
    userId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.repository.manager;

    await em.update(
      UserSession,
      { userId, isActive: true, revokedAt: IsNull() },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async createSession(
    userSession: CreateSessionInput,
    manager?: EntityManager,
  ): Promise<UserSession> {
    const em = manager ?? this.repository.manager;

    const session = em.create(UserSession, {
      userId: userSession.userId,
      currentTenantId: userSession.currentTenantId,
      userAgent: userSession.userAgent ?? null,
      deviceFingerprint: userSession.deviceFingerprint ?? null,
      isActive: true,
      revokedAt: null,
      lastSeenAt: null,
    });

    return em.save(UserSession, session);
  }

  async setRefreshTokenHash(
    sessionId: number,
    refreshTokenHash: string,
    manager?: EntityManager,
  ) {
    const em = manager ?? this.repository.manager;
    await em.update(UserSession, { id: sessionId }, { refreshTokenHash });
  }

  async setCurrentTenant(
    sessionId: number,
    tenantId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.repository.manager;

    await em.update(
      UserSession,
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

  async countActiveByTenant(
    tenantId: number,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager ?? this.repository.manager;

    const row = await em
      .createQueryBuilder(UserSession, 's')
      .innerJoin(
        TenantMembership,
        'm',
        'm.user_id = s.user_id AND m.tenant_id = s.current_tenant_id',
      )
      .where('s.current_tenant_id = :tenantId', { tenantId })
      .andWhere('s.is_active = true')
      .andWhere('s.revoked_at IS NULL')
      .andWhere('m.status = :status', { status: MembershipStatus.ACTIVE })
      .select('COUNT(*)', 'count')
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  }
}
