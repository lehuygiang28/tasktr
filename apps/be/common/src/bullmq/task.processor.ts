import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TaskJobName, BULLMQ_TASK_LOG_QUEUE, BULLMQ_TASK_QUEUE } from '~be/common/bullmq';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { addMonitorInterceptor, DURATION_KEY, RESPONSE_SIZE_KEY } from '~be/common/axios';
import { CreateTaskLogDto } from '~be/app/task-logs';

@Injectable()
@Processor(BULLMQ_TASK_QUEUE, {
    concurrency: Number(process.env['BULL_TASK_CONCURRENCY']) || 1,
})
export class TaskProcessor extends WorkerHost implements OnModuleInit {
    private readonly axios: AxiosInstance;

    constructor(
        private readonly logger: PinoLogger,
        private readonly httpService: HttpService,
        @InjectQueue(BULLMQ_TASK_LOG_QUEUE)
        readonly taskLogQueue: Queue<unknown, unknown, TaskJobName>,
    ) {
        super();
        this.logger.setContext(TaskProcessor.name);
        this.axios = this.httpService.axiosRef;
        addMonitorInterceptor(this.axios);
    }

    onModuleInit() {
        this.logger.debug(`BullMQProcessor for ${BULLMQ_TASK_QUEUE} is initialized and ready.`);
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

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers: headers ? JSON.parse(headers) : undefined,
            data: body,
        };

        let response: AxiosResponse | null;
        try {
            response = await this.httpService.axiosRef.request(config);
            this.logger.debug(
                `FETCH ${name} - ${response?.status} - ${response?.headers[DURATION_KEY]} ms - ${response?.headers[RESPONSE_SIZE_KEY]} bytes`,
            );
        } catch (error: AxiosError | unknown) {
            if (error instanceof AxiosError) {
                this.logger.error(error.response?.data);
            } else {
                this.logger.error(error);
            }
            response = null;
        }

        let taskLog: CreateTaskLogDto = {
            taskId: job.data._id,
            endpoint,
            method,
            scheduledAt: new Date(job?.processedOn ?? now),
            executedAt: new Date(job?.finishedOn ?? now),
            duration: 0,
            statusCode: 500,
            responseSizeBytes: 0,
        };

        if (response) {
            taskLog = {
                ...taskLog,
                statusCode: response.status,
                duration: response.headers[DURATION_KEY],
                responseSizeBytes: response.headers[RESPONSE_SIZE_KEY],
            };
        }

        await this.taskLogQueue.add(`saveTaskLog`, taskLog, {
            removeOnComplete: 1,
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });

        return true;
    }
}
