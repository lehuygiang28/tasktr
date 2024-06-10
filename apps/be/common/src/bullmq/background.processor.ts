import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';

import { BULLMQ_BG_JOB_QUEUE } from '~be/common/bullmq';
import { MailService } from '~be/common/mail';

export type BackgroundJobName = 'sendEmailRegister' | 'sendEmailLogin';

@Injectable()
@Processor(BULLMQ_BG_JOB_QUEUE, {
    concurrency: Number(process.env['BULL_BACKGROUND_CONCURRENCY']) || 1,
})
export class BackgroundProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        private readonly mailService: MailService,
    ) {
        super();
        this.logger.setContext(BackgroundProcessor.name);
    }

    onModuleInit() {
        this.logger.debug(
            `${BackgroundProcessor.name} for ${BULLMQ_BG_JOB_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown, unknown, BackgroundJobName>): Promise<unknown> {
        switch (job.name) {
            case 'sendEmailRegister':
                return this.sendEmailRegister(job);
            case 'sendEmailLogin':
                return this.sendEmailLogin(job);
            default:
                throw new Error(`Process ${job.name} not implemented`);
        }
    }

    async sendEmailRegister(job: Job<unknown, unknown, BackgroundJobName>): Promise<unknown> {
        const { email, url } = job.data as { email: string; url: string };
        return this.mailService.sendConfirmMail({
            to: email,
            mailData: {
                url,
            },
        });
    }

    async sendEmailLogin(job: Job<unknown, unknown, BackgroundJobName>): Promise<unknown> {
        const { email, url } = job.data as { email: string; url: string };
        return this.mailService.sendLogin({
            to: email,
            mailData: {
                url,
            },
        });
    }
}
