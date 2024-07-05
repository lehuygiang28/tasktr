import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { convertToObjectId, validateCronFrequency } from '~be/common/utils';
import { JwtPayloadType } from '~be/app/auth/strategies';
import {
    TaskLogsService,
    GetLogsByTaskIdDto,
    GetLogsByTaskIdResponseDto,
    TaskLogDto,
} from '~be/app/task-logs';
import { AllConfig } from '~be/app/config';

import { TasksRepository } from '../tasks.repository';
import { Task } from '../schemas/task.schema';
import { CreateTaskDto, GetTasksResponseDto, TaskDto, UpdateTaskDto, GetTasksDto } from '../dtos';
import { TaskSchedulingService } from './task-scheduling.service';

@Injectable()
export class TasksService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService<AllConfig>,
        private readonly taskRepo: TasksRepository,
        private readonly taskLogsService: TaskLogsService,
        private readonly taskSchedulingService: TaskSchedulingService,
    ) {
        this.logger.setContext(TasksService.name);
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
                minIntervalInSeconds: 60,
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
                timezone: data?.timezone ?? process.env.TZ ?? 'Asia/Ho_Chi_Minh',
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
            await this.taskSchedulingService.startCronTask(taskCreated);
        }

        return taskCreated;
    }

    async updateUserTask({
        id,
        data,
        user,
    }: {
        id: string;
        data: UpdateTaskDto;
        user: JwtPayloadType;
    }): Promise<TaskDto> {
        if (data?.name) {
            const taskFoundNamed = await this.taskRepo.findOne({
                filterQuery: {
                    name: data.name,
                    userId: convertToObjectId(user.userId),
                },
            });
            if (taskFoundNamed && taskFoundNamed._id.toString() !== id) {
                throw new UnprocessableEntityException({
                    errors: {
                        task: 'taskNameExist',
                    },
                    message: 'Task name already exist',
                });
            }
        }

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
                    minIntervalInSeconds: 60,
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
            updateQuery: {
                ...updateQuery,
            },
        });

        return this.taskSchedulingService.executeTask(oldTask, updatedTask);
    }

    async getTask({ id, user }: { id: string; user: JwtPayloadType }): Promise<TaskDto> {
        return this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });
    }

    async getTasks({
        user,
        query,
    }: {
        user: JwtPayloadType;
        query: GetTasksDto;
    }): Promise<GetTasksResponseDto> {
        const filter: FilterQuery<TaskDto> = {
            userId: convertToObjectId(user.userId),
            deletedAt: query?.isDeleted ? { $ne: null } : null,
        };
        const options: Partial<QueryOptions<Task>> = {};

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { endpoint: { $regex: query.search, $options: 'i' } },
            ];
        }

        if (query._id) {
            filter._id = convertToObjectId(query._id);
        }

        if (query.methods?.length) {
            filter.method = { $in: query.methods };
        }

        if (query.sortBy && query.sortOrder) {
            options.sort = { [query.sortBy]: query.sortOrder };
        }

        if (query.page && query.limit) {
            options.skip = (query.page - 1) * query.limit;
            options.limit = query.limit;
        }

        const [tasks, total] = await Promise.all([
            this.taskRepo.find({
                filterQuery: filter,
                queryOptions: options,
            }),
            this.taskRepo.count(filter),
        ]);

        return {
            data: tasks,
            total,
        };
    }

    async getLogsByTaskId({
        taskId,
        query,
        user,
    }: {
        taskId: string;
        query: GetLogsByTaskIdDto;
        user: JwtPayloadType;
    }): Promise<GetLogsByTaskIdResponseDto> {
        const queryOptions: Partial<QueryOptions<TaskLogDto>> = {};

        if (query.sortBy && query.sortOrder) {
            queryOptions.sort = { [query.sortBy]: query.sortOrder };
        }

        const foundTask = await this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(taskId),
                userId: convertToObjectId(user.userId),
            },
            queryOptions,
        });

        return this.taskLogsService.getLogsByTaskId({ taskId: foundTask._id, query });
    }

    async softDeleteTask({ id, user }: { id: string; user: JwtPayloadType }): Promise<void> {
        const foundTask = await this.taskRepo.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
            },
        });

        if (!foundTask) {
            throw new UnprocessableEntityException({
                message: 'This task does not exist or already deleted',
                errors: {
                    task: 'notExistOrAlreadyDeleted',
                },
            });
        }

        await Promise.all([
            this.taskRepo.softDelete(foundTask._id),
            this.taskSchedulingService.stopCronTask(foundTask),
        ]);
    }

    /**
     * User will trigger this to delete a task immediately
     */
    async triggerDeletedTask({ id, user }: { id: string; user: JwtPayloadType }): Promise<void> {
        const foundTask = await this.taskRepo.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
                userId: convertToObjectId(user.userId),
                deletedAt: { $ne: null },
            },
        });

        if (!foundTask) {
            throw new UnprocessableEntityException({
                message: 'This task does not exist in recycle bin',
                errors: {
                    task: 'notExistInRecycleBin',
                },
            });
        }

        await Promise.all([
            this.taskRepo.hardDelete(foundTask._id),
            this.taskLogsService.clearLogsByTaskId(foundTask._id),
        ]);
    }

    /**
     * Hard delete tasks with its logs
     */
    private async hardDeleteTask({ id }: { id: string | Types.ObjectId }): Promise<void> {
        const foundTask = await this.taskRepo.findOneOrThrow({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });

        this.logger.info(`Hard delete task with id: ${foundTask._id}`);

        await Promise.all([
            this.taskRepo.hardDelete(foundTask._id),
            this.taskLogsService.clearLogsByTaskId(foundTask._id),
            this.taskSchedulingService.stopCronTask(foundTask),
        ]);
    }

    /**
     * Use in cronjob - background job to scan and delete tasks that have been soft deleted
     */
    async scanToHardDeleteTasks(): Promise<void> {
        const deletionThreshold = this.configService.getOrThrow('tasks.softDeleteThresholdDays', {
            infer: true,
        });

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - deletionThreshold);

        const taskToDeletes = await this.taskRepo.find({
            filterQuery: {
                deletedAt: { $lt: thresholdDate },
            },
        });

        this.logger.info(
            `Found ${taskToDeletes.length} tasks to be deleted: ${taskToDeletes?.map((t) => t?._id?.toString())?.join(', ')}`,
        );

        await Promise.all(taskToDeletes.map((task) => this.hardDeleteTask({ id: task._id })));
    }

    async countUserTasks({
        user,
        query,
    }: {
        user: JwtPayloadType;
        query: FilterQuery<TaskDto>;
    }): Promise<number> {
        return this.taskRepo.count({
            userId: convertToObjectId(user.userId),
            ...query,
        });
    }
}
