import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

import {
    BULLMQ_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
} from '~be/common/bullmq/bullmq.constant';
import { axiosConfig } from '~be/common/axios';

import { Task, TaskSchema } from './schemas';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskLogsModule } from '../task-logs';
import { ClearTasksProcessor, TaskProcessor } from './processors';

@Module({
    imports: [
        HttpModule.register(axiosConfig),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        TaskLogsModule,
        BullModule.registerQueue({
            name: BULLMQ_TASK_QUEUE,
        }),
        BullModule.registerQueue({
            name: BULLMQ_TASK_LOG_QUEUE,
        }),
        BullModule.registerQueue({
            name: BULLMQ_CLEAR_TASK_QUEUE,
        }),
    ],
    controllers: [TasksController],
    providers: [TasksRepository, TasksService, TaskProcessor, ClearTasksProcessor],
    exports: [TasksService],
})
export class TasksModule {}
