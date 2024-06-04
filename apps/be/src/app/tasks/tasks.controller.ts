import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskDto } from './dtos';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { AuthRoles } from '../auth/guards/auth.guard';
import { CurrentUser } from '~be/common/utils';
import { JwtPayloadType } from '../auth/strategies';

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
        @Param('id') id: string,
        @Body() data: UpdateTaskDto,
        @CurrentUser() user: JwtPayloadType,
    ) {
        return this.tasksService.updateTask({ id, data, user });
    }

    @ApiOkResponse({ type: [TaskDto] })
    @Get('/')
    getTasks(@CurrentUser() user: JwtPayloadType) {
        return this.tasksService.getTasks({ user });
    }

    @ApiOkResponse({ type: TaskDto })
    @Get('/:id')
    getTask(@Param('id') id: string, @CurrentUser() user: JwtPayloadType) {
        return this.tasksService.getTask({ id, user });
    }
}
