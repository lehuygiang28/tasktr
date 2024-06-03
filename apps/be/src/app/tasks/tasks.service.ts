import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_NAME } from '~be/common/bullmq/bullmq.constant';
import { JobsOptions, Queue } from 'bullmq';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dtos';
import { Task } from './schemas/task.schema';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { convertToObjectId } from '~be/common/utils';
import { UpdateQuery } from 'mongoose';

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

    async createTask(data: CreateTaskDto) {
        const taskFoundNamed = await this.taskRepo.findOne({
            filterQuery: {
                name: data.name,
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

        const taskCreated = await this.taskRepo.create({
            document: {
                cronHistory: [],
                isEnable: false,
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

    async updateTask(id: string, data: UpdateTaskDto) {
        const oldTask = await this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });

        const updateQuery: UpdateQuery<Task> = { ...data };
        if (oldTask.cron !== data.cron) {
            updateQuery.cronHistory = [...(oldTask.cronHistory || []), oldTask.cron];
        }

        const newTask = await this.taskRepo.findOneAndUpdateOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
            updateQuery,
        });

        return this.executeTask(oldTask, newTask);
    }

    async getTask(id: string) {
        return this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });
    }

    async getTasks() {
        return this.taskRepo.find({
            filterQuery: {},
        });
    }
}
