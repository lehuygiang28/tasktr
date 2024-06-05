import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

import { BULLMQ_TASK_QUEUE, BULLMQ_TASK_LOG_QUEUE } from '~be/common/bullmq/bullmq.constant';
import { TaskProcessor, TaskLogProcessor } from '~be/common/bullmq';

import { Task, TaskSchema } from './schemas';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskLogsModule } from '../task-logs';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        BullModule.registerQueue({
            name: BULLMQ_TASK_QUEUE,
            connection: {
                host: process.env['REDIS_HOST'] ?? '',
                port: Number(process.env['REDIS_PORT']),
                password: process.env['REDIS_PASSWORD'],
            },
        }),
        TaskLogsModule,
        BullModule.registerQueue({
            name: BULLMQ_TASK_LOG_QUEUE,
        }),
    ],
    controllers: [TasksController],
    providers: [TasksRepository, TasksService, TaskProcessor, TaskLogProcessor],
    exports: [TasksService],
})
export class TasksModule {}
