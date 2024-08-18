import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';

import { Task } from '../schemas';
import { TaskRestoreService } from '../services/task-restore.service';
import { BULLMQ_RESTORE_TASK_FROM_DB_QUEUE } from '~be/common/bullmq';

@Processor(BULLMQ_RESTORE_TASK_FROM_DB_QUEUE)
export class TaskRestoreProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        @Inject(TaskRestoreService)
        private readonly taskRestoreService: TaskRestoreService,
    ) {
        super();
        this.logger.setContext(TaskRestoreProcessor.name);
    }

    onModuleInit() {
        this.logger.info(
            `${TaskRestoreProcessor.name} for ${BULLMQ_RESTORE_TASK_FROM_DB_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<Task>) {
        return this.taskRestoreService.execRestore(job.data);
    }
}
