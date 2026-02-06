import { Injectable } from '@nestjs/common';
import { TenantMembershipRepository } from './tenant-membership.repository';
import { MembershipStatus, TenantMembership } from './tenant-membership.entity';

@Injectable()
export class TenantMembershipService {
  constructor(
    private readonly tenantMembershipRepository: TenantMembershipRepository,
  ) {}

  getTenantMembershipById(id: number): Promise<TenantMembership | null> {
    return this.tenantMembershipRepository.findById(id);
  }

  async assertMembershipActive(args: {
    membershipId: number;
    userId: number;
    tenantId: number;
  }): Promise<TenantMembership | null> {
    const m = await this.tenantMembershipRepository.findById(args.membershipId);
    if (!m) return null;
    if (m.status !== MembershipStatus.ACTIVE) return null;
    if (m.userId !== args.userId) return null;
    if (m.tenantId !== args.tenantId) return null;
    return m;
  }

  async getActiveByUserId(userId: number): Promise<TenantMembership[]> {
    return this.tenantMembershipRepository.findActiveByUserId(userId);
  }

  async getActiveByUserAndTenant(
    userId: number,
    tenantId: number,
  ): Promise<TenantMembership | null> {
    return this.tenantMembershipRepository.findActiveByUserAndTenant(
      userId,
      tenantId,
    );
  }

  async getActiveByUserWithTenant(userId: number): Promise<TenantMembership[]> {
    return this.tenantMembershipRepository.findActiveByUserWithTenant(userId);
  }
}
