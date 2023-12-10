import { UserRoles } from '@app/common/users/enum';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(ROLES_KEY, context.getHandler());
    if (!roles) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.matchRoles(roles, user.userRoles);
  }

  matchRoles(roles: Array<UserRoles>, usersRoles: Array<UserRoles>) {
    return usersRoles.some((userRole) =>
      roles.some((role) => role === userRole),
    );
  }
}
