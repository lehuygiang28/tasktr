import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_NAME } from '~be/common/bullmq/bullmq.constant';
import { JobsOptions, Queue } from 'bullmq';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dtos';
import { Task } from './schemas/task.schema';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { convertToObjectId, validateCronFrequency } from '~be/common/utils';
import { UpdateQuery } from 'mongoose';
import { JwtPayloadType } from '../auth/strategies';

@Injectable()
export class TasksService {
    constructor(
        private readonly taskRepo: TasksRepository,
        @InjectQueue(QUEUE_NAME) readonly bullMQQueue: Queue,
    ) {}

    async startCron(task: Task) {
        const jobOptions: JobsOptions = {
            jobId: task._id.toString(),
            keepLogs: 20,
            repeat: {
                pattern: task.cron,
            },
            removeOnComplete: true,
            removeOnFail: true,
        };

        return this.bullMQQueue.add(`fetch`, task, jobOptions);
    }

    async stopCron(task: Task) {
        const isStopped = await this.bullMQQueue.removeRepeatable(
            `fetch`,
            {
                pattern: task.cron,
            },
            task._id.toString(),
        );
        return isStopped;
    }

    async executeTask(oldTask: Task, newTask: Task) {
        // Check if either the 'isEnable' status or the 'cron' expression has changed
        if (oldTask.isEnable !== newTask.isEnable || oldTask.cron !== newTask.cron) {
            // If the old task was enabled, stop the cron job
            if (oldTask.isEnable) {
                await this.stopCron(oldTask);
            }

            // If the new task is enabled, start the cron job
            if (newTask.isEnable) {
                await this.startCron(newTask);
            }
        }

        return newTask;
    }

    async createTask({ data, user }: { data: CreateTaskDto; user: JwtPayloadType }) {
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
            await this.startCron(taskCreated);
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
    }) {
        const oldTask = await this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });

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
        }

        const updateQuery: UpdateQuery<Task> = { ...data };
        if (oldTask.cron !== data.cron) {
            updateQuery.cronHistory = [...(oldTask.cronHistory || []), oldTask.cron];
        }

        const updatedTask = await this.taskRepo.findOneAndUpdateOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
            updateQuery,
        });

        return this.executeTask(oldTask, updatedTask);
    }

    async getTask({ id, user }: { id: string; user: JwtPayloadType }) {
        return this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });
    }

    async getTasks({ user }: { user: JwtPayloadType }) {
        return this.taskRepo.find({
            filterQuery: {
                userId: convertToObjectId(user.userId),
            },
        });
    }
}
