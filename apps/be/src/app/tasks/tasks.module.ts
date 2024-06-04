import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskProcessor, BULLMQ_TASK_QUEUE } from '~be/common/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';

@Module({
    imports: [
        HttpModule,
        BullModule.registerQueue({
            name: BULLMQ_TASK_QUEUE,
            connection: {
                host: process.env['REDIS_HOST'] ?? '',
                port: Number(process.env['REDIS_PORT']) || 6379,
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
