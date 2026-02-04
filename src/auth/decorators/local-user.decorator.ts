import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

const getCurrentUserByContext = (context: ExecutionContext): unknown =>
  context.switchToHttp().getRequest().user;

export const LocalUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    return getCurrentUserByContext(context) as User;
  },
);
