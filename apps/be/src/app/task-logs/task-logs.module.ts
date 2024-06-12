import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { BULLMQ_TASK_LOG_QUEUE } from '~be/common/bullmq';

import { TaskLog, TaskLogSchema } from './task-log.schema';
import { TaskLogsRepository } from './task-logs.repository';
import { TaskLogsService } from './task-logs.service';
import { TaskLogProcessor } from './task-log.processor';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TaskLog.name, schema: TaskLogSchema }]),
        BullModule.registerQueue({
            name: BULLMQ_TASK_LOG_QUEUE,
        }),
    ],
    providers: [TaskLogsRepository, TaskLogsService, TaskLogProcessor],
    exports: [TaskLogsService, TaskLogProcessor],
})
export class TaskLogsModule {}
