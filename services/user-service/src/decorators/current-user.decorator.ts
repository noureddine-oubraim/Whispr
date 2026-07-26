import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// @CurrentUser() → extrait req.user automatiquement dans le controller
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);