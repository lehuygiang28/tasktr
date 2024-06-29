import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { UserRoleEnum } from '~be/app/users/users.enum';
import { Roles } from '~be/common/utils/decorators';
import { RolesGuard } from './roles.guard';

export function AuthRoles(...roles: UserRoleEnum[]) {
    if (!roles?.length) {
        return applyDecorators(ApiBearerAuth(), Roles(...roles), UseGuards(AuthGuard('jwt')));
    }
    return applyDecorators(
        ApiBearerAuth(),
        Roles(...roles),
        UseGuards(AuthGuard('jwt'), RolesGuard),
    );
}
