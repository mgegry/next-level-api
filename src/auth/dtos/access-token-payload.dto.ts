import { Role } from 'src/user/role.enum';

export interface AccessTokenPayload {
  id: number;
  email: string;
  tenantId: string;
  role: Role;
}
