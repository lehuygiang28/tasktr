import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { UserRoleEnum } from '~be/app/users/users.enum';
import { getCurrentUserByContext, Roles } from '~be/common/utils/decorators';
import { JwtPayloadType } from '../strategies/types';

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

    /**
     * Add user to request
     * @param user The user to add to request
     * @param context The execution context of the current call
     */
    protected addUserToRequest(user: JwtPayloadType, context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        request.user = user;
    }

    protected getUserFromContext = (context: ExecutionContext): JwtPayloadType | null => {
        return getCurrentUserByContext(context);
    };
}
