import { Injectable } from '@nestjs/common';
import { TenantMembershipRepository } from 'src/membership/tenant-membership.repository';

@Injectable()
export class MembershipRoleService {
  constructor(private readonly membershipRepo: TenantMembershipRepository) {}

  async assignRoleToMembership(membershipId: number, roleId: number | null) {
    const { changed } = await this.membershipRepo.assignRoleStrict(
      membershipId,
      roleId,
    );

    return { ok: true, changed };
  }
}
