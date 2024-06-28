import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentUser, IdParamDto } from '~be/common/utils';

import { TasksService } from './tasks.service';
import {
    CreateTaskDto,
    GetTasksResponseDto,
    TaskDto,
    TryRequestResponseDto,
    UpdateTaskDto,
    GetTasksDto,
    TryRequestDto,
} from './dtos';
import { AuthRoles } from '../auth/guards/auth.guard';
import { JwtPayloadType } from '../auth/strategies';
import { GetLogsByTaskIdDto, GetLogsByTaskIdResponseDto } from '../task-logs/dtos';

@AuthRoles()
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @ApiCreatedResponse({ type: TaskDto })
    @Post('/')
    createTask(@Body() data: CreateTaskDto, @CurrentUser() user: JwtPayloadType) {
        return this.tasksService.createTask({ data, user });
    }

    @ApiOkResponse({ type: TryRequestResponseDto })
    @HttpCode(HttpStatus.OK)
    @Post('/try')
    tryRequest(@Body() data: TryRequestDto) {
        return this.tasksService.tryRequestTask({ taskData: data });
    }

    @ApiOkResponse({ type: TaskDto })
    @HttpCode(HttpStatus.OK)
    @Patch('/:id')
    updateTask(
        @Param() { id }: IdParamDto,
        @Body() data: UpdateTaskDto,
        @CurrentUser() user: JwtPayloadType,
    ) {
        return this.tasksService.updateTask({ id, data, user });
    }

    @ApiOkResponse({ type: GetTasksResponseDto })
    @Get('/')
    getTasks(@CurrentUser() user: JwtPayloadType, @Query() query: GetTasksDto) {
        return this.tasksService.getTasks({ user, query });
    }

    @ApiOkResponse({ type: TaskDto })
    @Get('/:id')
    getTask(@Param() { id }: IdParamDto, @CurrentUser() user: JwtPayloadType) {
        return this.tasksService.getTask({ id, user });
    }

    @ApiOkResponse({ type: GetLogsByTaskIdDto })
    @Get('/logs/:id')
    async getLogsByTaskId(
        @Param() { id }: IdParamDto,
        @Query() query: GetLogsByTaskIdDto,
        @CurrentUser() user: JwtPayloadType,
    ): Promise<GetLogsByTaskIdResponseDto> {
        return this.tasksService.getLogsByTaskId({ taskId: id, query, user });
    }

    @ApiParam({ name: 'id' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/:id')
    deleteTask(@Param() { id }: IdParamDto, @CurrentUser() user: JwtPayloadType) {
        return this.tasksService.softDeleteTask({ id, user });
    }

    @ApiParam({ name: 'id' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('/hard/:id')
    hardDeleteTask(@Param() { id }: IdParamDto, @CurrentUser() user: JwtPayloadType) {
        return this.tasksService.triggerDeletedTask({ id, user });
    }
}
