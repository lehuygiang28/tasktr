import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TasksModule } from '../tasks';
import { TaskLogsModule } from '../task-logs';

@Module({
    imports: [TasksModule, TaskLogsModule],
    controllers: [StatsController],
    providers: [StatsService],
    exports: [StatsService],
})
export class StatsModule {}
