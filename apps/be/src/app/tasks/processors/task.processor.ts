import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { BULLMQ_TASK_LOG_QUEUE, BULLMQ_TASK_QUEUE } from '~be/common/bullmq';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { CreateTaskLogDto, TaskLogsJobName } from '~be/app/task-logs';
import { type Timings } from '@szmarczak/http-timer';

@Injectable()
@Processor(BULLMQ_TASK_QUEUE, {
    concurrency: Number(process.env['BULL_TASK_CONCURRENCY']) || 10,
})
export class TaskProcessor extends WorkerHost implements OnModuleInit {
    private readonly axios: AxiosInstance;

    constructor(
        private readonly logger: PinoLogger,
        private readonly httpService: HttpService,
        @InjectQueue(BULLMQ_TASK_LOG_QUEUE)
        readonly taskLogQueue: Queue<unknown, unknown, TaskLogsJobName>,
    ) {
        super();
        this.logger.setContext(TaskProcessor.name);
        this.axios = this.httpService.axiosRef;
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

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers: headers ? JSON.parse(headers) : undefined,
            data: body,
        };

        let response: AxiosResponse | null;
        let timings: Timings | null;
        try {
            response = await this.httpService.axiosRef.request(config);
            timings = response.request['timings'] || null;

            this.logger.info(
                `FETCH ${name} - ${response?.status} - ${timings?.phases?.total} ms - ${JSON.stringify(response?.data)?.length ?? 0} bytes`,
            );
        } catch (error: AxiosError | unknown) {
            if (error instanceof AxiosError) {
                this.logger.error(error.response?.data);
            } else {
                this.logger.error(error);
            }
            response = null;
            timings = null;
        }

        const taskLog: CreateTaskLogDto = {
            taskId: job.data._id,
            endpoint,
            method,
            workerName: process.env['WORKER_NAME'] ?? 'default',
            scheduledAt: new Date(job?.processedOn ?? now),
            executedAt: new Date(job?.finishedOn ?? now),

            duration: timings?.phases?.total ?? 0,
            statusCode: response?.status ?? 0,
            responseSizeBytes: JSON.stringify(response?.data)?.length ?? 0,
            timings: timings?.phases || {},
        };

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
