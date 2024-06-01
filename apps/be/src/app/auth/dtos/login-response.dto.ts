import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UserDto } from '~be/app/users';

export class LoginResponseDto extends IntersectionType(UserDto) {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}
