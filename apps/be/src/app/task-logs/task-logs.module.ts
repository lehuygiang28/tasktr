import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';

import { BULLMQ_TASK_LOG_QUEUE } from '~be/common/bullmq';

import { TaskLog, TaskLogSchema } from './task-log.schema';
import { TaskLogsRepository } from './task-logs.repository';
import { TaskLogsService } from './task-logs.service';
import { TaskLogProcessor } from './task-log.processor';

const providers: Provider[] = [TaskLogsRepository, TaskLogsService];

if (!(process.env['SAVE_LOG_CONCURRENCY'] && Number(process.env['SAVE_LOG_CONCURRENCY']) <= 0)) {
    providers.push(TaskLogProcessor);
}

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TaskLog.name, schema: TaskLogSchema }]),
        BullModule.registerQueue({
            name: BULLMQ_TASK_LOG_QUEUE,
        }),
    ],
    providers: providers,
    exports: [TaskLogsService],
})
export class TaskLogsModule {}
