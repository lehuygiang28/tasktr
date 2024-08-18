import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { JobsOptions, Queue } from 'bullmq';

import { BULLMQ_RESTORE_TASK_FROM_DB_QUEUE, InjectQueueDecorator } from '~be/common/bullmq';

import { TasksRepository } from '../tasks.repository';
import { TaskSchedulingService } from './task-scheduling.service';
import { Task } from '../schemas';

@Injectable()
export class TaskRestoreService implements OnModuleInit {
    constructor(
        private readonly taskRepo: TasksRepository,
        private readonly taskSchedulingService: TaskSchedulingService,
        private readonly logger: PinoLogger,
        @InjectQueueDecorator(BULLMQ_RESTORE_TASK_FROM_DB_QUEUE)
        private readonly restoreQueue: Queue,
    ) {}

    async onModuleInit() {
        return this.restoreCronTaskOnStartup();
    }

    /**
     * Processor will call this function to restore a task
     */
    async execRestore(task: Task) {
        return this.forceExecuteTask(task);
    }

    /**
     * This will be called on startup, and add restore task to queue
     */
    private async restoreCronTaskOnStartup() {
        let cursor: string | undefined;
        do {
            const newTasks = await this.taskRepo.findMany({
                filterQuery: {
                    isEnable: true,
                    $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
                },
                cursor,
                limit: 100,
            });
            cursor = newTasks.length > 0 ? newTasks[newTasks.length - 1]._id.toString() : undefined;
            await Promise.all(newTasks.map((task) => this.addRestoreTaskToQueue(task)));
        } while (cursor);
    }

    private async addRestoreTaskToQueue(task: Task) {
        const jobOptions: JobsOptions = {
            jobId: task._id.toString(),
            removeOnComplete: true,
            removeOnFail: true,
            priority: 900,
            attempts: 10,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
        };

        return this.restoreQueue.add('restoreTask', task, jobOptions);
    }

    private async forceExecuteTask(task: Task) {
        await this.taskSchedulingService.stopCronTask(task);
        return this.taskSchedulingService.startCronTask(task);
    }
}
