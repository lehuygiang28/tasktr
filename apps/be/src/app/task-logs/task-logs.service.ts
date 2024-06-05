import { Injectable } from '@nestjs/common';

import { convertToObjectId } from '~be/common/utils/common';

import { TaskLogsRepository } from './task-logs.repository';
import { TaskLog } from './task-log.schema';
import { CreateTaskLogDto } from './dtos';
import { ConfigService } from '@nestjs/config';

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
                taskId: taskLog.taskId,
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
            document: taskLog,
        });
    }

    async getById(id: string): Promise<TaskLog> {
        return this.taskLogsRepository.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });
    }

    async getLogsByTaskId(taskId: string): Promise<TaskLog[]> {
        return this.taskLogsRepository.find({
            filterQuery: {
                taskId: convertToObjectId(taskId),
            },
        });
    }
}
