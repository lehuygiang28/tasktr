import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { type Timings } from '@szmarczak/http-timer';

import { BULLMQ_TASK_QUEUE, InjectTaskLogQueue } from '~be/common/bullmq';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { CreateTaskLogDto, TaskLogJobName } from '~be/app/task-logs';
import { defaultHeaders } from '~be/common/axios';
import { normalizeHeaders } from '~be/common/utils';

@Injectable()
@Processor(BULLMQ_TASK_QUEUE, {
    concurrency: Number(process.env['TASKS_CONCURRENCY']) || 10,
})
export class TaskProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        private readonly httpService: HttpService,
        @InjectTaskLogQueue()
        private readonly taskLogQueue: Queue<unknown, unknown, TaskLogJobName>,
    ) {
        super();
        this.logger.setContext(TaskProcessor.name);
    }

    onModuleInit() {
        this.logger.info(
            `${TaskProcessor.name} for ${BULLMQ_TASK_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<unknown>): Promise<unknown> {
        if (job.name.startsWith('fetch')) {
            return this.fetch(job as unknown as Job<Task>);
        } else {
            throw new Error(`Process ${job.name} not implemented`);
        }
    }

    async fetch(job: Job<Task>): Promise<boolean> {
        const now = Date.now();
        const { name, endpoint, method, body, headers } = job.data;

        const normalizedHeaders = headers ? normalizeHeaders(JSON.parse(headers)) : {};
        const headersValidated = Object.assign(normalizeHeaders(defaultHeaders), normalizedHeaders);

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers: headersValidated,
            data: body,
        };

        let response: AxiosResponse | null;
        let timings: Timings | null;
        let errorMessage: string | null = null;
        try {
            response = await this.httpService.axiosRef.request(config);
            timings = response.request['timings'] || null;

            this.logger.info(
                `FETCH ${name} - ${response?.status} - ${timings?.phases?.total} ms - ${String(response?.data ?? '')?.length ?? 0} bytes`,
            );
        } catch (error: AxiosError | Error | unknown) {
            if (error instanceof AxiosError) {
                this.logger.error(error.response?.data);
                errorMessage = error?.message;
            } else {
                this.logger.error(error);
            }
            response = null;
            timings = null;
            errorMessage = error['message'] ?? 'Unknown error';
        }

        const stringBody = String(response?.data ?? '');

        const taskLog: CreateTaskLogDto = {
            taskId: job.data._id,
            endpoint,
            method,
            workerName: process.env['WORKER_NAME'] ?? 'default',
            scheduledAt: new Date(job?.processedOn ?? now),
            executedAt: new Date(job?.finishedOn ?? now),

            duration: timings?.phases?.total ?? 0,
            statusCode: response?.status ?? 0,
            responseSizeBytes: stringBody?.length ?? 0,
            timings: timings?.phases || {},

            request: {
                headers: response.config?.headers,
                body: String(config?.data || ''),
            },

            response: {
                headers: response?.headers,
                body:
                    stringBody?.length > Number(process.env['MAX_BODY_LOG_SIZE'] || 1024 * 50) // Default 50KB
                        ? `Body too large (${stringBody?.length} bytes), will not be logged.`
                        : stringBody,
            },

            errorMessage,
        };

        await this.taskLogQueue.add(`saveTaskLog`, taskLog, {
            removeOnComplete: 1,
            removeOnFail: 1,
            attempts: 10,
            // delay: 5000,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });

        return true;
    }
}
