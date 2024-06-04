import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';

import { BULLMQ_TASK_QUEUE, TaskProcessor } from '~be/common/bullmq';

import { Task, TaskSchema } from './schemas';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';

@Module({
    imports: [
        HttpModule,
        BullModule.registerQueue({
            name: BULLMQ_TASK_QUEUE,
            connection: {
                host: process.env['REDIS_HOST'] ?? '',
                port: Number(process.env['REDIS_PORT']),
                password: process.env['REDIS_PASSWORD'],
            },
        }),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ],
    controllers: [TasksController],
    providers: [TasksRepository, TasksService, TaskProcessor],
    exports: [TasksService],
})
export class TasksModule {}
