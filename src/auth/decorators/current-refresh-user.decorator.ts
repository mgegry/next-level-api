import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshUser } from '../interfaces/refresh-user.interface';

const getCurrentUserByContext = (context: ExecutionContext): unknown =>
  context.switchToHttp().getRequest().user;

export const CurrentRefreshUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RefreshUser => {
    return getCurrentUserByContext(context) as RefreshUser;
  },
);
