import { Injectable, OnModuleInit, UnprocessableEntityException } from '@nestjs/common';
import { Queue, JobsOptions } from 'bullmq';

import { InjectClearTaskQueue, InjectTaskQueue } from '~be/common/bullmq';
import { Task } from '../schemas/task.schema';
import { ClearTasksJobName } from '../processors';

@Injectable()
export class TaskSchedulingService implements OnModuleInit {
    private readonly SCAN_DELETED_TASK_CRON = '0 6 * * *'; // 6AM daily
    private readonly SCAN_DELETED_TASK_CRON_HISTORIC: string[] = [];

    constructor(
        @InjectTaskQueue() private readonly taskQueue: Queue,
        @InjectClearTaskQueue()
        private readonly clearTaskQueue: Queue<unknown, unknown, ClearTasksJobName>,
    ) {}

    async onModuleInit() {
        /**
         * Add cron background job to scan and delete tasks that have been soft deleted
         */
        if (this.SCAN_DELETED_TASK_CRON_HISTORIC) {
            await Promise.allSettled(
                this.SCAN_DELETED_TASK_CRON_HISTORIC.map((cron) => {
                    this.clearTaskQueue.removeRepeatable(
                        'clearTasks',
                        {
                            pattern: cron,
                        },
                        'clearTasks_id',
                    );
                }),
            );
        }

        await this.clearTaskQueue.add(
            'clearTasks',
            {},
            {
                jobId: 'clearTasks_id',
                removeOnComplete: true,
                removeOnFail: true,
                priority: 900,
                attempts: 9,
                repeat: {
                    pattern: this.SCAN_DELETED_TASK_CRON,
                },
            },
        );
    }

    public async startCronTask(task: Task) {
        if (task?.deletedAt) {
            await this.stopCronTask(task);
            throw new UnprocessableEntityException({
                message: 'Task has been deleted',
                errors: {
                    task: 'deleted',
                },
            });
        }

        const jobOptions: JobsOptions = {
            jobId: task._id.toString(),
            repeat: {
                pattern: task.cron,
            },
            removeOnComplete: true,
            removeOnFail: true,
            priority: 1000,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 3000,
            },
        };

        return this.taskQueue.add(`fetch`, task, jobOptions);
    }

    public async stopCronTask(task: Task): Promise<boolean> {
        const taskIdString = task._id.toString();
        const [isStopped] = await Promise.allSettled([
            this.taskQueue.removeRepeatable(
                `fetch`,
                {
                    pattern: task.cron,
                },
                taskIdString,
            ),
            ...task.cronHistory.map((cron) => {
                return this.taskQueue.removeRepeatable(
                    `fetch`,
                    {
                        pattern: cron,
                    },
                    taskIdString,
                );
            }),
        ]);
        return isStopped.status === 'fulfilled';
    }

    public async executeTask(oldTask: Task, newTask: Task) {
        // Check if either the 'isEnable' status or the 'cron' expression has changed
        if (
            oldTask.isEnable !== newTask.isEnable ||
            oldTask.endpoint !== newTask.endpoint ||
            oldTask.method !== newTask.method ||
            oldTask.cron !== newTask.cron ||
            oldTask.headers !== newTask.headers ||
            oldTask.body !== newTask.body ||
            oldTask.timezone !== newTask.timezone
        ) {
            // If the old task was enabled, stop the cron job
            if (oldTask.isEnable) {
                await this.stopCronTask(oldTask);
            }

            // If the new task is enabled, start the cron job
            if (newTask.isEnable) {
                await this.startCronTask(newTask);
            }
        }

        return newTask;
    }
}
