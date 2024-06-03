import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUE_NAME } from './bullmq.constant';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { addMonitorInterceptor, DURATION_KEY, RESPONSE_SIZE_KEY } from '../axios/interceptors';

@Injectable()
@Processor(QUEUE_NAME, {
    concurrency: Number(process.env['BULL_CONCURRENCY']) || 1,
})
export class BullMQProcessor extends WorkerHost implements OnModuleInit {
    private readonly axios: AxiosInstance;

    constructor(
        private readonly logger: PinoLogger,
        private readonly httpService: HttpService,
    ) {
        super();
        this.logger.setContext(BullMQProcessor.name);
        this.axios = this.httpService.axiosRef;
        addMonitorInterceptor(this.axios);
    }

    onModuleInit() {
        this.logger.debug(`BullMQProcessor for ${QUEUE_NAME} is initialized and ready.`);
    }

    async process(job: Job<unknown>): Promise<unknown> {
        if (job.name.startsWith('fetch')) {
            return this.fetch(job as unknown as Job<Task>);
        } else {
            throw new Error(`Process ${job.name} not implemented`);
        }
    }

    async fetch(job: Job<Task>): Promise<unknown> {
        const { name, endpoint, method, body, headers } = job.data;

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers,
            data: body,
        };

        try {
            const response: AxiosResponse = await this.httpService.axiosRef.request(config);
            this.logger.debug(
                `FETCH ${QUEUE_NAME}-${job.id} - ${name} - ${response.status} - ${response.headers[DURATION_KEY]} ms - ${response.headers[RESPONSE_SIZE_KEY]} bytes`,
            );
            return true;
        } catch (error: AxiosError | unknown) {
            if (error instanceof AxiosError) {
                this.logger.error(error.response?.data);
                throw 'An error happened!';
            }

            throw 'An error happened!';
        }
    }
}
