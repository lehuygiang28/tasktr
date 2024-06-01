import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { UserDto } from '../../users/dtos';

export class AuthSignupDto extends IntersectionType(
    PickType(UserDto, ['email']),
    PickType(PartialType(UserDto), ['fullName']),
) {}
