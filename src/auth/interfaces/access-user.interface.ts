import { Role } from 'src/membership/tenant-membership.entity';

export interface AccessUser {
  userId: number;
  email: string;
  sessionId: number;
  tenantId: number;
  membershipId: number;
  role: Role;
  tokenType: string;
}
