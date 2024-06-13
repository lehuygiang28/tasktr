import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';

import { BULLMQ_TASK_LOG_QUEUE } from '~be/common/bullmq';
import { TaskLogsService } from './task-logs.service';
import { CreateTaskLogDto } from './dtos';

export type TaskLogsJobName = 'saveTaskLog';

@Injectable()
@Processor(BULLMQ_TASK_LOG_QUEUE, {
    concurrency: Number(process.env['BULL_SAVE_LOG_CONCURRENCY']) || 10,
})
export class TaskLogProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        private readonly taskLogsService: TaskLogsService,
    ) {
        super();
        this.logger.setContext(TaskLogProcessor.name);
    }

    onModuleInit() {
        this.logger.info(
            `${TaskLogProcessor.name} for ${BULLMQ_TASK_LOG_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown, unknown, TaskLogsJobName>): Promise<unknown> {
        switch (job.name) {
            case 'saveTaskLog':
                return this.saveTaskLog(job);
            default:
                throw new Error(`Process ${job.name} not implemented`);
        }
    }

    async saveTaskLog(job: Job<unknown, unknown, TaskLogsJobName>): Promise<boolean> {
        try {
            const res = await this.taskLogsService.create(job.data as CreateTaskLogDto);
            if (res) {
                this.logger.info(`Saved task log: ${res._id}`);
            }
            return !!res;
        } catch (error) {
            this.logger.error(`Error saving task log: ${error}`);
            throw new Error(`Failed to save task log: ${error}`);
        }
    }
}