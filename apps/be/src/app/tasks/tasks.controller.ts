import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskDto } from './dtos';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateTaskDto } from './dtos/update-task.dto';

//TODO: Implement auth
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @ApiCreatedResponse({ type: TaskDto })
    @Post('/')
    createTask(@Body() data: CreateTaskDto) {
        return this.tasksService.createTask(data);
    }

    @ApiOkResponse({ type: TaskDto })
    @HttpCode(HttpStatus.OK)
    @Patch('/:id')
    updateTask(@Param('id') id: string, @Body() data: UpdateTaskDto) {
        return this.tasksService.updateTask(id, data);
    }

    @ApiOkResponse({ type: [TaskDto] })
    @Get('/')
    getTasks() {
        return this.tasksService.getTasks();
    }

    @ApiOkResponse({ type: TaskDto })
    @Get('/:id')
    getTask(@Param('id') id: string) {
        return this.tasksService.getTask(id);
    }
}
