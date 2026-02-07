import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipStatus, TenantMembership } from './tenant-membership.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantRole } from 'src/access-control/entities/tenant-role.entity';

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
      order: { tenantId: 'ASC', id: 'ASC' },
    });
  }

  async assignRole(membershipId: number, roleId: number | null): Promise<void> {
    await this.repository.update({ id: membershipId }, { roleId });
  }

  async assignRoleStrict(
    membershipId: number,
    roleId: number | null,
    manager?: EntityManager,
  ): Promise<{ changed: boolean }> {
    const em = manager ?? this.repository.manager;

    // CASE 1: clear role
    if (roleId === null) {
      const rows = await em.query(
        `
        UPDATE tenant_membership
        SET role_id = NULL,
            permission_version = permission_version + 1,
            updated_at = now()
        WHERE id = $1
          AND role_id IS NOT NULL
        RETURNING id
        `,
        [membershipId],
      );

      // If no rows, either membership not found OR role already null.
      if (rows.length === 0) {
        const exists = await em.findOne(TenantMembership, {
          where: { id: membershipId },
        });
        if (!exists) throw new NotFoundException('Membership not found');
        return { changed: false }; // already null
      }

      return { changed: true };
    }

    // CASE 2: set roleId (must belong to same tenant)
    const updated = await em.query(
      `
      UPDATE tenant_membership tm
      SET role_id = $2,
          permission_version = permission_version + 1,
          updated_at = now()
      FROM tenant_role tr
      WHERE tm.id = $1
        AND tr.id = $2
        AND tr.tenant_id = tm.tenant_id
        AND tm.role_id IS DISTINCT FROM $2
      RETURNING tm.id
      `,
      [membershipId, roleId],
    );

    if (updated.length > 0) {
      return { changed: true };
    }

    // No rows updated -> figure out why

    // 1) membership exists?
    const membership = await em.findOne(TenantMembership, {
      where: { id: membershipId },
    });
    if (!membership) throw new NotFoundException('Membership not found');

    // 2) role exists?
    const role = await em.findOne(TenantRole, { where: { id: roleId } });
    if (!role) throw new NotFoundException('Role not found');

    // 3) role belongs to same tenant?
    if (role.tenantId !== membership.tenantId) {
      // You can choose NotFound or Forbidden; I prefer Forbidden because it's "exists but not allowed"
      throw new ForbiddenException('Role does not belong to this tenant');
    }

    // 4) otherwise it was a no-op (same role already assigned)
    return { changed: false };
  }

  async bumpPermissionVersionByRoleId(
    roleId: number,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager ?? this.repository.manager;

    await em.query(
      `
    UPDATE tenant_membership
    SET permission_version = permission_version + 1,
        updated_at = now()
    WHERE role_id = $1
    `,
      [roleId],
    );
  }

  async listMembershipIdsByRoleId(roleId: number): Promise<number[]> {
    const rows = await this.repository.find({
      where: { roleId },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
