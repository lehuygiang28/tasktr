import { OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { type Timings } from '@szmarczak/http-timer';

import { BULLMQ_TASK_QUEUE, InjectTaskLogQueue } from '~be/common/bullmq';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { CreateTaskLogDto, TaskLogJobName } from '~be/app/task-logs';
import { defaultHeaders } from '~be/common/axios';
import { normalizeHeaders } from '~be/common/utils';
import { RedisService } from '~be/common/redis/services';
import { MailService } from '~be/common/mail';
import { UsersService } from '~be/app/users';
import { AllConfig } from '~be/app/config';

import { TASK_FAIL_STREAK_PREFIX } from '../tasks.constant';
import { TasksService } from '../services';

type TaskFailStreak = {
    [key: string]: number;
};

@Processor(BULLMQ_TASK_QUEUE, {
    concurrency: Number(process.env['TASKS_CONCURRENCY']) || 10,
})
export class TaskProcessor extends WorkerHost implements OnModuleInit {
    constructor(
        private readonly logger: PinoLogger,
        private readonly httpService: HttpService,
        @InjectTaskLogQueue()
        private readonly taskLogQueue: Queue<unknown, unknown, TaskLogJobName>,
        private readonly redisService: RedisService,
        private readonly taskService: TasksService,
        private readonly configService: ConfigService<AllConfig>,
        private readonly mailService: MailService,
        private readonly usersService: UsersService,
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
        switch (job.name) {
            case 'fetch':
                return this.fetch(job as unknown as Job<Task>);
            default:
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

            if (response.status >= 400 && response.status < 599) {
                throw new Error(`Failed to fetch, status: ${response.status}`);
            }

            const timings: Timings = response?.request['timings'] || null;
            const stringBody = String(response?.data ?? '');

            await Promise.all([
                this.logSuccess(job, response, timings, stringBody),
                this.postprocessFetchTask(job, true),
            ]);
        } catch (error) {
            await Promise.all([
                this.handleError(error, job),
                this.postprocessFetchTask(job, false),
            ]);
            throw new Error(`Failed to fetch, error: ${this.extractErrorMessage(error)}`);
        }

        return true;
    }

    private async postprocessFetchTask(job: Job<Task>, isSuccessful: boolean) {
        const maxFailStreak = job.data?.options?.stopAfterFailures || 0;

        if (maxFailStreak <= 0) {
            return;
        }

        const key = `${TASK_FAIL_STREAK_PREFIX}_${job.data.userId.toString()}`;
        const failedStreak = (await this.redisService.get<TaskFailStreak>(key)) || {};

        if (!isSuccessful) {
            const currentStreak = failedStreak[job.data._id.toString()] || 0;
            const newFailedStreak = {
                ...failedStreak,
                [job.data._id.toString()]: currentStreak + 1,
            };
            await this.redisService.set(key, newFailedStreak);

            if (newFailedStreak[job.data._id.toString()] >= maxFailStreak) {
                this.logger.warn(
                    `Task ${job.data._id.toString()} has been disabled due to too many failures: ${newFailedStreak[job.data._id.toString()]} / ${maxFailStreak}`,
                );

                const promises: unknown[] = [
                    this.taskService.disableTask({ task: job.data }),
                    this.mailService.sendStopTask({
                        to: (await this.usersService.findById(job.data.userId.toString())).email,
                        mailData: {
                            url: `${this.configService.getOrThrow('app.feDomain', { infer: true })}/tasks/show/${job.data._id.toString()}`,
                        },
                    }),
                ];

                delete newFailedStreak[job.data._id.toString()];

                // If the record is empty after deletion, remove it from Redis. Otherwise, update it.
                if (Object.keys(newFailedStreak).length === 0) {
                    promises.push(this.redisService.del(key));
                } else {
                    promises.push(this.redisService.set(key, newFailedStreak));
                }

                await Promise.all(promises);
            }
        } else {
            // If the task was successful, check if it exists in the fail streak record and remove it
            if (Object.prototype.hasOwnProperty.call(failedStreak, job.data._id.toString())) {
                delete failedStreak[job.data._id.toString()];
                // If after removal, the record is empty, delete the key from Redis, else update the record
                if (Object.keys(failedStreak).length === 0) {
                    await this.redisService.del(key);
                } else {
                    await this.redisService.set(key, failedStreak);
                }
            }
        }
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
            request: {
                headers: response.config?.headers,
                body: String(response.config?.data || ''),
            },
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
