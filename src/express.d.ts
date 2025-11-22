import { User } from './user/user.entity';

declare module 'express' {
  interface Request {
    user?: User;
  }
}
