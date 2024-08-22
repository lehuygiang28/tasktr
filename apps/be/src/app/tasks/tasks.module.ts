import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ConditionalModule, ConfigModule } from '@nestjs/config';

import {
    BULLMQ_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
    BULLMQ_RESTORE_TASK_FROM_DB_QUEUE,
    BULLMQ_BG_JOB_QUEUE,
} from '~be/common/bullmq/bullmq.constant';
import { axiosConfig } from '~be/common/axios';
import { RedisModule } from '~be/common/redis';
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
import { DiscordModule } from '~be/common/discord';

const importProviders = [
    ConfigModule.forFeature(tasksConfig),
    HttpModule.register(axiosConfig),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    RedisModule,
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
    BullModule.registerQueue({
        name: BULLMQ_BG_JOB_QUEUE,
    }),
    ConditionalModule.registerWhen(
        DiscordModule,
        (env: NodeJS.ProcessEnv) =>
            !env?.DISCORD_BOT_TOKEN || !isNullOrUndefined(env?.DISCORD_BOT_TOKEN),
    ),
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
