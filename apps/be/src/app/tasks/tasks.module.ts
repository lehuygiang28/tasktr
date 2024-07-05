import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import {
    BULLMQ_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
} from '~be/common/bullmq/bullmq.constant';
import { axiosConfig } from '~be/common/axios';

import { Task, TaskSchema } from './schemas';
import { TasksController } from './tasks.controller';
import { TasksService, TaskExecutionService, TaskSchedulingService } from './services';
import { TasksRepository } from './tasks.repository';
import { TaskLogsModule } from '../task-logs';
import { TaskProcessor, ClearTasksProcessor } from './processors';
import tasksConfig from './config/tasks-config';

const providers: Provider[] = [
    TasksRepository,
    TasksService,
    TaskSchedulingService,
    TaskExecutionService,
];

if (!(process.env['TASK_CONCURRENCY'] && Number(process.env['TASK_CONCURRENCY']) <= 0)) {
    providers.push(TaskProcessor);
}

if (!(process.env['CLEAR_LOG_CONCURRENCY'] && Number(process.env['CLEAR_LOG_CONCURRENCY']) <= 0)) {
    providers.push(ClearTasksProcessor);
}

@Module({
    imports: [
        ConfigModule.forFeature(tasksConfig),
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
    providers: providers,
    exports: [TasksService],
})
export class TasksModule {}
