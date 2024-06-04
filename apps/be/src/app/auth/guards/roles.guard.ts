import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '~be/app/users/users.enum';
import { Roles } from '~be/common/utils/decorators';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<UserRoleEnum[]>(Roles.name, [
            context.getClass(),
            context.getHandler(),
        ]);
        if (!roles?.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        console.log(request.user);

        return roles.includes(request.user?.role);
    }
}
