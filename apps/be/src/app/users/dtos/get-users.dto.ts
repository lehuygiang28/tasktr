import { ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { PaginationRequestDto } from '~be/common/utils';
import { UserDto } from './user.dto';
import { UserRoleEnum } from '../users.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class GetUsersDto extends IntersectionType(
    PickType(PartialType(UserDto), ['emailVerified'] as const),
    PaginationRequestDto,
) {
    @ApiPropertyOptional({
        type: [UserRoleEnum],
        enum: UserRoleEnum,
        description: 'Filter by user roles',
        example: [UserRoleEnum.Admin, UserRoleEnum.Customer],
    })
    @IsOptional()
    @IsEnum(UserRoleEnum, { each: true })
    roles?: UserRoleEnum[];
}
