import { Controller, HttpStatus, SerializeOptions, HttpCode, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UserDto } from './dtos';
import { UserRoleEnum } from './users.enum';
import type { NullableType } from '~be/common/utils';

@ApiTags('users')
@Controller({
    path: '/users',
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @SerializeOptions({
        groups: [UserRoleEnum.Admin],
    })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({
        type: UserDto,
    })
    create(@Body() createProfileDto: CreateUserDto): Promise<NullableType<UserDto>> {
        return this.usersService.create(createProfileDto);
    }
}
