import { Injectable } from '@nestjs/common';
import {
  MembershipStatus,
  TenantMembership,
} from '../entities/tenant-membership.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TenantMembershipRepository {
  constructor(
    @InjectRepository(TenantMembership)
    private readonly repository: Repository<TenantMembership>,
  ) {}

  async findById(membershipId: number): Promise<TenantMembership | null> {
    return this.repository.findOne({ where: { id: membershipId } });
  }

  async findActiveByUserId(userId: number): Promise<TenantMembership[]> {
    return this.repository.find({
      where: { userId, status: MembershipStatus.ACTIVE },
      order: { id: 'ASC' }, // stable default
    });
  }

  async findActiveByUserAndTenant(
    userId: number,
    tenantId: number,
  ): Promise<TenantMembership | null> {
    return this.repository.findOne({
      where: {
        userId,
        tenantId,
        status: MembershipStatus.ACTIVE,
      },
    });
  }

  async findActiveByUserWithTenant(
    userId: number,
  ): Promise<TenantMembership[]> {
    return this.repository.find({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: { tenant: true },
      order: { tenantId: 'ASC' },
    });
  }
}
