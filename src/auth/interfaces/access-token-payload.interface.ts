import { Role } from 'src/tenant/entities/tenant-membership.entity';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  sid: number; // session id
  tid: number; // tenant id
  mid: number; // membership id
  role: Role;
}
