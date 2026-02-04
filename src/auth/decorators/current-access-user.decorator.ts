import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessUser } from '../interfaces/access-user.interface';

const getCurrentUserByContext = (context: ExecutionContext): unknown =>
  context.switchToHttp().getRequest().user;

export const CurrentAccessUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessUser => {
    return getCurrentUserByContext(context) as AccessUser;
  },
);
