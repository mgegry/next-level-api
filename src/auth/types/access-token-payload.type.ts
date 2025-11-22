import { Role } from 'src/user/role.enum';

export type AccessTokenPayload = {
  id: number;
  email: string;
  role: Role;
};
