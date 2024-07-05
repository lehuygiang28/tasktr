import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/services/tasks.service';
import { TaskLogsService } from '../task-logs';
import { JwtPayloadType } from '../auth';
import { StatsResponseDto } from './dtos';

@Injectable()
export class StatsService {
    constructor(
        private readonly tasksService: TasksService,
        private readonly taskLogsService: TaskLogsService,
    ) {}

    async getStatsUserDashboard({ user }: { user: JwtPayloadType }): Promise<StatsResponseDto> {
        const [enableTask, disableTask, someLastLogs] = await Promise.all([
            this.tasksService.countUserTasks({
                user,
                query: {
                    isEnable: true,
                },
            }),
            this.tasksService.countUserTasks({
                user,
                query: {
                    isEnable: false,
                },
            }),
            this.taskLogsService.findLastLogsByUserId(user.userId),
        ]);

        const successCount = someLastLogs.filter(
            (log) => log.statusCode >= 200 && log.statusCode < 400,
        ).length;
        const failedCount = someLastLogs.length - successCount;
        const successRate = successCount / someLastLogs.length;
        const failedRate = failedCount / someLastLogs.length;

        return {
            enableTask,
            disableTask,
            successRate,
            failedRate,
            logs: someLastLogs,
        };
    }
}
