import {
    Controller,
    HttpStatus,
    SerializeOptions,
    HttpCode,
    Post,
    Body,
    Query,
    Get,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersDto, GetUsersResponseDto, UserDto } from './dtos';
import { UserRoleEnum } from './users.enum';
import type { IdParamDto, NullableType } from '~be/common/utils';
import { AuthRoles } from '../auth';

// @AuthRoles(UserRoleEnum.Admin)
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
    create(@Body() userData: CreateUserDto): Promise<NullableType<UserDto>> {
        return this.usersService.create(userData);
    }

    @Get('/')
    getUsers(@Query() getUsersDto: GetUsersDto): Promise<GetUsersResponseDto> {
        return this.usersService.getUsers({ query: getUsersDto });
    }

    @Get('/:id')
    getUserById(@Param() { id }: IdParamDto): Promise<UserDto> {
        return this.usersService.getUserById(id);
    }
}
