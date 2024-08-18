import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import {
    BULLMQ_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
    BULLMQ_RESTORE_TASK_FROM_DB_QUEUE,
} from '~be/common/bullmq/bullmq.constant';
import { axiosConfig } from '~be/common/axios';
import { RedisModule } from '~be/common/redis';
import { MailModule } from '~be/common/mail';
import { UsersModule } from '~be/app/users';

import { Task, TaskSchema } from './schemas';
import { TasksController } from './tasks.controller';
import {
    TasksService,
    TaskExecutionService,
    TaskRestoreService,
    TaskSchedulingService,
} from './services';
import { TasksRepository } from './tasks.repository';
import { TaskLogsModule } from '../task-logs';
import { TaskProcessor, ClearTasksProcessor } from './processors';
import tasksConfig from './config/tasks-config';
import { TaskRestoreProcessor } from './processors/restore-task.processor';
import { isNullOrUndefined, isTrueSet } from '~be/common/utils';

const importProviders = [
    ConfigModule.forFeature(tasksConfig),
    HttpModule.register(axiosConfig),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    RedisModule,
    MailModule,
    UsersModule,
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
];

const providers: Provider[] = [
    TasksRepository,
    TasksService,
    TaskExecutionService,
    TaskSchedulingService,
];

if (!(process.env['TASK_CONCURRENCY'] && Number(process.env['TASK_CONCURRENCY']) <= 0)) {
    providers.push(TaskProcessor);
}

if (!(process.env['CLEAR_LOG_CONCURRENCY'] && Number(process.env['CLEAR_LOG_CONCURRENCY']) <= 0)) {
    providers.push(ClearTasksProcessor);
}

if (
    isNullOrUndefined(process.env['RESTORE_TASK_ON_STARTUP']) ||
    isTrueSet(process.env['RESTORE_TASK_ON_STARTUP'])
) {
    importProviders.push(
        BullModule.registerQueue({
            name: BULLMQ_RESTORE_TASK_FROM_DB_QUEUE,
        }),
    );
    providers.push(TaskRestoreService, TaskRestoreProcessor);
}

@Module({
    imports: importProviders,
    controllers: [TasksController],
    providers: providers,
    exports: [TasksService],
})
export class TasksModule {}
