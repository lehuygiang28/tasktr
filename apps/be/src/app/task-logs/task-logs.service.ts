import { Injectable } from '@nestjs/common';

import { convertToObjectId } from '~be/common/utils/common';

import { TaskLogsRepository } from './task-logs.repository';
import { TaskLog } from './task-log.schema';
import {
    CreateTaskLogDto,
    GetLogsByTaskIdDto,
    GetLogsByTaskIdResponseDto,
    TaskLogDto,
} from './dtos';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, QueryOptions, Types } from 'mongoose';

@Injectable()
export class TaskLogsService {
    constructor(
        private readonly configsService: ConfigService,
        private readonly taskLogsRepository: TaskLogsRepository,
    ) {}
    private readonly MAX_LOGS_PER_TASK = this.configsService.get<number>('MAX_LOGS_PER_TASK') || 10;

    async create(taskLog: CreateTaskLogDto): Promise<TaskLog> {
        const logs = await this.taskLogsRepository.find({
            filterQuery: {
                taskId: convertToObjectId(taskLog.taskId),
            },
            queryOptions: {
                limit: this.MAX_LOGS_PER_TASK,
                sort: { createdAt: 1 },
            },
        });

        if (logs?.length >= this.MAX_LOGS_PER_TASK) {
            const oldestLog = logs[0];
            await this.taskLogsRepository.delete(oldestLog._id);
        }

        return this.taskLogsRepository.create({
            document: {
                ...taskLog,
                taskId: convertToObjectId(taskLog.taskId),
            },
        });
    }

    async getById(id: string): Promise<TaskLog> {
        return this.taskLogsRepository.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });
    }

    async getLogsByTaskId({
        taskId,
        query,
    }: {
        taskId: string | Types.ObjectId;
        query: GetLogsByTaskIdDto;
    }): Promise<GetLogsByTaskIdResponseDto> {
        const filter: FilterQuery<TaskLogDto> = {
            taskId: convertToObjectId(taskId),
        };
        const options: Partial<QueryOptions<TaskLogDto>> = {};

        if (query.sortBy && query.sortOrder) {
            options.sort = { [query.sortBy]: query.sortOrder };
        }

        if (query.page && query.limit) {
            options.skip = (query.page - 1) * query.limit;
            options.limit = query.limit;
        }

        const [logs, total] = await Promise.all([
            this.taskLogsRepository.find({
                filterQuery: filter,
                queryOptions: options,
            }),
            this.taskLogsRepository.count(filter),
        ]);

        return {
            data: logs,
            total,
            page: query.page || 1,
            limit: query.limit || logs?.length || 0,
        };
    }
}
