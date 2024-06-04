import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '~be/app/users/users.enum';

export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(Roles.name, roles);
