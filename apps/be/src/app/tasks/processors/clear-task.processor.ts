import { Injectable, OnModuleInit } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';

import { BULLMQ_CLEAR_TASK_QUEUE } from '~be/common/bullmq';
import { TasksService } from '../tasks.service';

export type ClearTasksJobName = 'clearTasks';

@Injectable()
@Processor(BULLMQ_CLEAR_TASK_QUEUE, {
    concurrency: Number(process.env['BULL_CLEAR_LOG_CONCURRENCY']) || 1,
})
export class ClearTasksProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        private readonly tasksService: TasksService,
    ) {
        super();
        this.logger.setContext(ClearTasksProcessor.name);
    }

    onModuleInit() {
        this.logger.info(
            `${ClearTasksProcessor.name} for ${BULLMQ_CLEAR_TASK_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown, unknown, ClearTasksJobName>): Promise<unknown> {
        switch (job.name) {
            case 'clearTasks':
                return this.scanDeletedTasks(job);
            default:
                return;
        }
    }

    private async scanDeletedTasks(job: Job<unknown, unknown, ClearTasksJobName>): Promise<void> {
        this.logger.info(`Scanning deleted tasks: ${job.name}`);
        await this.tasksService.scanToHardDeleteTasks();
    }
}
