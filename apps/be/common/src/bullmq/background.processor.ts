import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BULLMQ_BG_JOB_QUEUE } from '~be/common/bullmq';

@Injectable()
@Processor(BULLMQ_BG_JOB_QUEUE, {
    concurrency: Number(process.env['BULL_CONCURRENCY']) || 1,
})
export class BackgroundProcessor extends WorkerHost implements OnModuleInit {
    constructor(private readonly logger: PinoLogger) {
        super();
        this.logger.setContext(BackgroundProcessor.name);
    }

    onModuleInit() {
        this.logger.debug(
            `${BackgroundProcessor.name} for ${BULLMQ_BG_JOB_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown>): Promise<unknown> {
        if (job.name.startsWith('fetch')) {
            return console.log('object');
        } else {
            throw new Error(`Process ${job.name} not implemented`);
        }
    }
}
