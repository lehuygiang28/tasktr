import { Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { type Timings } from '@szmarczak/http-timer';

import {
    BULLMQ_BG_JOB_QUEUE,
    BULLMQ_DISCORD_QUEUE,
    BULLMQ_TASK_QUEUE,
    InjectQueueDecorator,
    InjectTaskLogQueue,
} from '~be/common/bullmq';
import { Task } from '~be/app/tasks/schemas/task.schema';
import { CreateTaskLogDto, TaskLogJobName } from '~be/app/task-logs';
import { defaultHeaders } from '~be/common/axios';
import { isTrueSet, normalizeHeaders, isNullOrUndefined } from '~be/common/utils';
import { RedisService } from '~be/common/redis/services';
import { MailJobName, NotifyStopTaskOptions } from '~be/common/mail';
import { UsersService } from '~be/app/users';
import { AllConfig } from '~be/app/config';

import { TASK_FAIL_STREAK_PREFIX } from '../tasks.constant';
import { TasksService } from '../services';
import { ErrorNotificationEnum } from '../enums';
import { DiscordJobName } from '~be/common/discord';
import { SendDirectMessage, SendMessage } from '~be/common/discord/discord.type';

type TaskFailStreak = {
    [key: string]: number;
};

@Processor(BULLMQ_TASK_QUEUE, {
    concurrency: Number(process.env['TASKS_CONCURRENCY']) || 10,
})
export class TaskProcessor extends WorkerHost implements OnModuleInit {
    private readonly logger: Logger;

    constructor(
        private readonly httpService: HttpService,
        @InjectTaskLogQueue()
        private readonly taskLogQueue: Queue<unknown, unknown, TaskLogJobName>,
        private readonly redisService: RedisService,
        private readonly taskService: TasksService,
        private readonly configService: ConfigService<AllConfig>,
        private readonly usersService: UsersService,
        @InjectQueueDecorator(BULLMQ_DISCORD_QUEUE)
        private readonly discordQueue: Queue<unknown, unknown, DiscordJobName>,
        @InjectQueueDecorator(BULLMQ_BG_JOB_QUEUE)
        private readonly bgQueue: Queue<unknown, unknown, MailJobName>,
    ) {
        super();
        this.logger = new Logger(TaskProcessor.name);
    }

    onModuleInit() {
        this.logger.log(`${TaskProcessor.name} for ${BULLMQ_TASK_QUEUE} is initialized and ready.`);
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
        const { attemptsStarted, data } = job;
        const { endpoint, method, body, headers } = data;

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

        const response = await this.httpService.axiosRef.request(config);

        const timings: Timings = response?.request['timings'] || null;
        const stringBody = String(response?.data ?? '');

        try {
            if (response.status >= 400) {
                throw new Error(`Failed to fetch, status: ${response.status}`);
            }

            await Promise.all([
                this.saveTaskLog(job, response, timings, stringBody),
                this.postprocessFetchTask({ job, isSuccessful: true, attemptsStarted }),
            ]);
        } catch (error) {
            const isLastAttempt = attemptsStarted >= (job?.opts?.attempts || 1);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let promises: Promise<any>[] = [
                this.handleError(error, job),
                this.postprocessFetchTask({ job, isSuccessful: false, attemptsStarted }),
            ];

            if (isLastAttempt) {
                if (isTrueSet(job?.data?.options?.alert?.jobExecutionFailed)) {
                    promises = [
                        ...promises,
                        this.notifyUser(job, ErrorNotificationEnum.jobExecutionFailed),
                    ];
                }
                promises = [...promises, this.saveTaskLog(job, response, timings, stringBody)];
            }

            await Promise.all(promises);
            throw new Error(`Failed to fetch, error: ${this.extractErrorMessage(error)}`);
        }

        return true;
    }

    private async postprocessFetchTask(data: {
        job: Job<Task>;
        isSuccessful: boolean;
        attemptsStarted: number;
    }) {
        const { job, isSuccessful, attemptsStarted } = data;
        const options = job.data?.options || {};

        const maxFailStreak = options?.stopAfterFailures || 0;

        if (maxFailStreak <= 0) {
            return;
        }

        if (attemptsStarted < job?.opts?.attempts) {
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
                    this.notifyUser(job, ErrorNotificationEnum.disableByTooManyFailures),
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

    private async saveTaskLog(
        job: Job<Task>,
        response: AxiosResponse,
        timings: Timings | null,
        stringBody: string,
    ) {
        const { name } = job.data;
        const taskLog = this.createTaskLog(job, response, timings, stringBody);

        this.logger.log(
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
        const { endpoint, method, _id: taskId, options } = job.data;
        const now = Date.now();
        const maxBodyLogSize = Number(process.env['MAX_BODY_LOG_SIZE'] || 1024 * 50); // Default 50KB

        let log: CreateTaskLogDto = {
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
            errorMessage: null,
        };

        if (isTrueSet(options?.saveResponse)) {
            log = {
                ...log,
                response: {
                    headers: response.headers,
                    body:
                        stringBody?.length > maxBodyLogSize
                            ? `Body too large (${stringBody?.length} bytes), will not be logged.`
                            : stringBody,
                },
            };
        }

        return log;
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

    private async notifyUser(job: Job<Task>, notifyType: ErrorNotificationEnum) {
        const { options } = job.data;

        switch (notifyType) {
            case ErrorNotificationEnum.disableByTooManyFailures: {
                if (isTrueSet(options?.alert?.disableByTooManyFailures)) {
                    return this.notifyTooManyFailures(job);
                }
                break;
            }
            case ErrorNotificationEnum.jobExecutionFailed: {
                if (isTrueSet(options?.alert?.jobExecutionFailed)) {
                    return this.notifyJobExecutionFailed(job);
                }
                break;
            }
            default:
                break;
        }

        return 'DONE';
    }

    private async notifyTooManyFailures(job: Job<Task>) {
        const taskUrl = `${this.configService.getOrThrow('app.feDomain', { infer: true })}/tasks/logs/${job.data._id.toString()}`;

        const promises = [];
        const { options } = job.data;
        const discordOptions = options?.alert?.alertOn?.discord || {};
        const discordMessage = {
            content: '**Task Disabled Notification**',
            embeds: [
                {
                    title: 'Task Disabled',
                    description: 'The task has been disabled due to too many failures.',
                    color: 16711680, // Red color
                    fields: [
                        {
                            name: 'Task Name',
                            value: job.data.name,
                        },
                        {
                            name: 'Reason',
                            value: 'Too many failures',
                        },
                        {
                            name: 'Task URL',
                            value: taskUrl,
                        },
                    ],
                    url: taskUrl,
                    footer: {
                        text: 'Please check the task logs for more details.',
                    },
                },
            ],
        };

        if (!isNullOrUndefined(discordOptions?.dmUserId) && discordOptions?.dmUserId != '') {
            promises.push(
                this.discordQueue.add(
                    'sendDirectMessage',
                    {
                        dmUserId: discordOptions.dmUserId,
                        message: discordMessage,
                    } satisfies SendDirectMessage,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                    },
                ),
            );
        }

        if (!isNullOrUndefined(discordOptions?.channelId) && discordOptions?.channelId != '') {
            promises.push(
                this.discordQueue.add(
                    'sendMessage',
                    {
                        channelId: discordOptions.channelId,
                        message: discordMessage,
                    } satisfies SendMessage,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                        backoff: { type: 'exponential', delay: 3000 },
                    },
                ),
            );
        }

        if (isTrueSet(options?.alert?.alertOn?.email)) {
            promises.push(
                this.bgQueue.add(
                    'notifyStopTask',
                    {
                        to: (await this.usersService.findById(job.data.userId.toString())).email,
                        data: {
                            url: taskUrl,
                        },
                        typeErr: ErrorNotificationEnum.disableByTooManyFailures,
                    } satisfies NotifyStopTaskOptions,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                        backoff: { type: 'exponential', delay: 3000 },
                    },
                ),
            );
        }

        return Promise.allSettled(promises);
    }

    private async notifyJobExecutionFailed(job: Job<Task>) {
        const taskUrl = `${this.configService.getOrThrow('app.feDomain', { infer: true })}/tasks/logs/${job.data._id.toString()}`;

        const promises = [];
        const { options } = job.data;
        const discordOptions = options?.alert?.alertOn?.discord || {};
        const discordMessage = {
            content: '**Task Failed Notification**',
            embeds: [
                {
                    title: 'Task Execution Failed',
                    description: 'The task has been failed',
                    color: 16776960, // Yellow color for warning
                    fields: [
                        {
                            name: 'Task Name',
                            value: job.data.name,
                        },
                        {
                            name: 'Task URL',
                            value: taskUrl,
                        },
                    ],
                    url: taskUrl,
                    footer: {
                        text: 'Please check the task logs for more details.',
                    },
                },
            ],
        };

        if (!isNullOrUndefined(discordOptions?.dmUserId) && discordOptions?.dmUserId != '') {
            promises.push(
                this.discordQueue.add(
                    'sendDirectMessage',
                    {
                        dmUserId: discordOptions.dmUserId,
                        message: discordMessage,
                    } satisfies SendDirectMessage,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                        backoff: { type: 'exponential', delay: 3000 },
                    },
                ),
            );
        }

        if (!isNullOrUndefined(discordOptions?.channelId) && discordOptions?.channelId != '') {
            promises.push(
                this.discordQueue.add(
                    'sendMessage',
                    {
                        message: discordMessage,
                        channelId: discordOptions.channelId,
                    } satisfies SendMessage,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                        backoff: { type: 'exponential', delay: 3000 },
                    },
                ),
            );
        }

        if (isTrueSet(options?.alert?.alertOn?.email)) {
            promises.push(
                this.bgQueue.add(
                    'notifyStopTask',
                    {
                        to: (await this.usersService.findById(job.data.userId.toString())).email,
                        data: {
                            url: taskUrl,
                        },
                        typeErr: ErrorNotificationEnum.jobExecutionFailed,
                    } satisfies NotifyStopTaskOptions,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 10,
                        backoff: { type: 'exponential', delay: 3000 },
                    },
                ),
            );
        }

        return Promise.allSettled(promises);
    }
}
