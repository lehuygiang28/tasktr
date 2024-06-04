import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { UpdateQuery } from 'mongoose';

import { BULLMQ_TASK_QUEUE } from '~be/common/bullmq/bullmq.constant';
import { convertToObjectId, validateCronFrequency } from '~be/common/utils';
import { JwtPayloadType } from '~be/app/auth/strategies';

import { TasksRepository } from './tasks.repository';
import { Task } from './schemas/task.schema';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dtos';

@Injectable()
export class TasksService {
    constructor(
        private readonly taskRepo: TasksRepository,
        @InjectQueue(BULLMQ_TASK_QUEUE) readonly taskQueue: Queue,
    ) {}

    async startCronTask(task: Task) {
        const jobOptions: JobsOptions = {
            jobId: task._id.toString(),
            keepLogs: 20,
            repeat: {
                pattern: task.cron,
            },
            removeOnComplete: true,
            removeOnFail: true,
            priority: 1000,
        };

        return this.taskQueue.add(`fetch`, task, jobOptions);
    }

    async stopCronTask(task: Task): Promise<boolean> {
        const [isStopped] = await Promise.allSettled([
            this.taskQueue.removeRepeatable(
                `fetch`,
                {
                    pattern: task.cron,
                },
                task._id.toString(),
            ),
            ...task.cronHistory.map((cron) => {
                return this.taskQueue.removeRepeatable(
                    `fetch`,
                    {
                        pattern: cron,
                    },
                    task._id.toString(),
                );
            }),
        ]);
        return isStopped.status === 'fulfilled';
    }

    async executeTask(oldTask: Task, newTask: Task) {
        // Check if either the 'isEnable' status or the 'cron' expression has changed
        if (oldTask.isEnable !== newTask.isEnable || oldTask.cron !== newTask.cron) {
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

    async createTask({
        data,
        user,
    }: {
        data: CreateTaskDto;
        user: JwtPayloadType;
    }): Promise<TaskDto> {
        const taskFoundNamed = await this.taskRepo.findOne({
            filterQuery: {
                name: data.name,
                userId: convertToObjectId(user.userId),
            },
        });
        if (taskFoundNamed) {
            throw new UnprocessableEntityException({
                errors: {
                    task: 'taskNameExist',
                },
                message: 'Task name already exist',
            });
        }

        const valid = validateCronFrequency(
            {
                cronExpression: data.cron,
                timeZone: data.timezone,
            },
            {
                minIntervalInSeconds: 2 * 60,
                numTasks: 1,
            },
        );
        if (typeof valid === 'object') {
            throw new UnprocessableEntityException({
                errors: {
                    task: valid.err,
                },
                message: valid.message,
            });
        }

        const taskCreated = await this.taskRepo.create({
            document: {
                cronHistory: [],
                isEnable: false,
                userId: convertToObjectId(user.userId),
                ...data,
            },
        });

        if (!taskCreated) {
            throw new UnprocessableEntityException({
                errors: {
                    task: 'taskErr',
                },
                message: 'Some thing went wrong, please try again',
            });
        }

        if (taskCreated.isEnable) {
            await this.startCronTask(taskCreated);
        }

        return taskCreated;
    }

    async updateTask({
        id,
        data,
        user,
    }: {
        id: string;
        data: UpdateTaskDto;
        user: JwtPayloadType;
    }): Promise<TaskDto> {
        const oldTask = await this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });
        const updateQuery: UpdateQuery<Task> = { ...data };

        if (data?.cron) {
            const valid = validateCronFrequency(
                {
                    cronExpression: data.cron,
                    timeZone: data.timezone,
                },
                {
                    minIntervalInSeconds: 2 * 60,
                    numTasks: 1,
                },
            );
            if (typeof valid === 'object') {
                throw new UnprocessableEntityException({
                    errors: {
                        task: valid.err,
                    },
                    message: valid.message,
                });
            }

            if (oldTask.cron !== data.cron) {
                updateQuery.cronHistory = Array.from(
                    new Set([...(oldTask.cronHistory || []), oldTask.cron]),
                );
            }
        }

        const updatedTask = await this.taskRepo.findOneAndUpdateOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
            updateQuery,
        });

        return this.executeTask(oldTask, updatedTask);
    }

    async getTask({ id, user }: { id: string; user: JwtPayloadType }): Promise<TaskDto> {
        return this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });
    }

    async getTasks({ user }: { user: JwtPayloadType }): Promise<TaskDto[]> {
        return this.taskRepo.find({
            filterQuery: {
                userId: convertToObjectId(user.userId),
            },
        });
    }
}
