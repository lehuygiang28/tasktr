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
        const { endpoint, method, body, headers } = job.data;

        const headersValidated = {
            ...normalizeHeaders(defaultHeaders),
            ...(headers ? normalizeHeaders(JSON.parse(headers)) : {}),
        };

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers: headersValidated,
            data: body,
        };

        try {
            const response = await this.httpService.axiosRef.request(config);
            const timings = response?.request['timings'] || null;
            const stringBody = String(response?.data ?? '');

            await this.logSuccess(job, response, timings, stringBody);
        } catch (error) {
            await this.handleError(error, job);
            throw new Error(`Failed to fetch, error: ${this.extractErrorMessage(error)}`);
        }

        return true;
    }

    private async logSuccess(
        job: Job<Task>,
        response: AxiosResponse,
        timings: Timings | null,
        stringBody: string,
    ) {
        const { name } = job.data;
        const taskLog = this.createTaskLog(job, response, timings, stringBody);

        this.logger.info(
            `FETCH ${name} - ${response?.status} - ${timings?.phases?.total ?? 0} ms - ${stringBody?.length} bytes`,
        );

        await this.taskLogQueue.add(`saveTaskLog`, taskLog, {
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 10,
            backoff: { type: 'exponential', delay: 3000 },
        });
    }

    private createTaskLog(
        job: Job<Task>,
        response: AxiosResponse,
        timings: Timings | null,
        stringBody: string,
    ): CreateTaskLogDto {
        const { endpoint, method, _id: taskId } = job.data;
        const now = Date.now();
        const maxBodyLogSize = Number(process.env['MAX_BODY_LOG_SIZE'] || 1024 * 50); // Default 50KB

        return {
            taskId,
            endpoint,
            method,
            workerName: process.env['WORKER_NAME'] ?? 'default',
            scheduledAt: new Date(job.processedOn ?? now),
            executedAt: new Date(job.finishedOn ?? now),
            duration: timings?.phases?.total ?? 0,
            statusCode: response?.status ?? 0,
            responseSizeBytes: stringBody?.length,
            timings: timings?.phases || {},
            request: { headers: response.config?.headers, body: String(response.config?.data || '') },
            response: {
                headers: response.headers,
                body:
                    stringBody?.length > maxBodyLogSize
                        ? `Body too large (${stringBody?.length} bytes), will not be logged.`
                        : stringBody,
            },
            errorMessage: null,
        };
    }

    private async handleError(error: unknown, job: Job<Task>) {
        const errorMessage = this.extractErrorMessage(error);
        this.logger.error(`Error fetching ${job.data.name}: ${errorMessage}`);
    }

    private extractErrorMessage(error: unknown): string {
        if (error instanceof AxiosError) {
            return error.message;
        } else if (error instanceof Error) {
            return error.message;
        }
        return 'Unknown error';
    }
}
