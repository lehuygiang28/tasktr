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
    Patch,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser, IdParamDto, NullableType } from '~be/common/utils';
import { AuthRoles } from '~be/app/auth/guards/auth.guard';

import { UsersService } from './users.service';
import {
    BlockUserDto,
    CreateUserDto,
    GetUsersDto,
    GetUsersResponseDto,
    UpdateUserDto,
    UserDto,
} from './dtos';
import { UserRoleEnum } from './users.enum';
import type { JwtPayloadType } from '../auth';

@AuthRoles(UserRoleEnum.Admin)
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

    @Patch('/:id')
    updateUser(
        @CurrentUser() actor: JwtPayloadType,
        @Param() { id: userId }: IdParamDto,
        @Body() data: UpdateUserDto,
    ) {
        console.log(data);
        return this.usersService.updateUser({ actor, userId, data });
    }

    @Patch('block/:id')
    blockUser(
        @CurrentUser() actor: JwtPayloadType,
        @Param() { id: userId }: IdParamDto,
        @Body() data: BlockUserDto,
    ): Promise<NullableType<UserDto>> {
        return this.usersService.blockUser({ actor, userId, data });
    }

    @Patch('unblock/:id')
    unblockUser(
        @CurrentUser() actor: JwtPayloadType,
        @Param() { id: userId }: IdParamDto,
    ): Promise<NullableType<UserDto>> {
        return this.usersService.unblockUser({ actor, userId });
    }
}
