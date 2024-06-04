import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from '~be/common/utils/decorators';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRoleEnum } from '~be/app/users/users.enum';

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
