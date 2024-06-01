import {
    Controller,
    Get,
    HttpStatus,
    SerializeOptions,
    HttpCode,
    Query,
    Param,
    Post,
    Body,
    Patch,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiExtraModels } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UserDto } from './dtos';
import { UserRoleEnum } from './users.enum';
import { NullableType } from '~be/common/utils';

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
