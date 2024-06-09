import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, GetTasksResponseDto, TaskDto } from './dtos';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { AuthRoles } from '../auth/guards/auth.guard';
import { CurrentUser, IdParamDto } from '~be/common/utils';
import { JwtPayloadType } from '../auth/strategies';
import { GetTasksDto } from './dtos/get-tasks.dto';
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
}
