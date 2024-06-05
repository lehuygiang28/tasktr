import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TaskLog, TaskLogSchema } from './task-log.schema';
import { TaskLogsRepository } from './task-logs.repository';
import { TaskLogsService } from './task-logs.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: TaskLog.name, schema: TaskLogSchema }])],
    providers: [TaskLogsRepository, TaskLogsService],
    exports: [TaskLogsService],
})
export class TaskLogsModule {}
