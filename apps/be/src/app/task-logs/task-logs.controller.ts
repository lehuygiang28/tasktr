// import { Controller, Get, Param, Query } from '@nestjs/common';
// import { TaskLogsService } from './task-logs.service';
// import { GetLogsByTaskIdDto, GetLogsByTaskIdResponseDto } from './dtos';
// import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

// @ApiTags('task-logs')
// @Controller('task-logs')
// export class TaskLogsController {
//     constructor(private readonly taskLogsService: TaskLogsService) {}

//     @ApiOkResponse({ type: GetLogsByTaskIdDto })
//     @Get('/:taskId')
//     async getLogsByTaskId(
//         @Param('taskId') taskId: string,
//         @Query() query: GetLogsByTaskIdDto,
//     ): Promise<GetLogsByTaskIdResponseDto> {
//         return this.taskLogsService.getLogsByTaskId({ taskId, query });
//     }
// }
