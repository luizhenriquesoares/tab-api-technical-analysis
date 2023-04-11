import { IAuthUser } from './auth.user.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext): IAuthUser => {
  const request = ctx.switchToHttp().getRequest();
  const user: IAuthUser = request.user;
  return user;
});
