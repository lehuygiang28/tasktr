import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';

import { BULLMQ_BG_JOB_QUEUE } from '~be/common/bullmq';
import { MailService, NotifyStopTaskOptions } from '~be/common/mail';
import { ModuleRef } from '@nestjs/core';

export type MailJobName = 'sendEmailRegister' | 'sendEmailLogin' | 'notifyStopTask';

@Processor(BULLMQ_BG_JOB_QUEUE, {
    useWorkerThreads: true,
    concurrency: Number(process.env['MAIL_CONCURRENCY']) || 5,
})
@Injectable()
export class MailProcessor extends WorkerHost implements OnModuleInit {
    private mailService: MailService;

    constructor(
        private readonly logger: PinoLogger,
        private readonly moduleRef: ModuleRef,
    ) {
        super();
        this.logger.setContext(MailProcessor.name);
    }

    onModuleInit() {
        this.mailService = this.moduleRef.get<MailService>(MailService);
        this.logger.info(
            `${MailProcessor.name} for ${BULLMQ_BG_JOB_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown, unknown, MailJobName>): Promise<unknown> {
        switch (job.name) {
            case 'sendEmailRegister':
                return this.sendEmailRegister(job);
            case 'sendEmailLogin':
                return this.sendEmailLogin(job);
            case 'notifyStopTask': {
                return this.notifyStopTask(job as Job<NotifyStopTaskOptions>);
            }
            default:
                return;
        }
    }

    private async sendEmailRegister(job: Job<unknown, unknown, MailJobName>): Promise<unknown> {
        const { email, url } = job.data as { email: string; url: string };
        return this.mailService.sendConfirmMail({
            to: email,
            mailData: {
                url,
            },
        });
    }

    private async sendEmailLogin(job: Job<unknown, unknown, MailJobName>): Promise<unknown> {
        const { email, url } = job.data as { email: string; url: string };
        return this.mailService.sendLogin({
            to: email,
            mailData: {
                url,
            },
        });
    }

    private async notifyStopTask(job: Job<NotifyStopTaskOptions>) {
        return this.mailService.notifyStopTask(job.data);
    }
}
