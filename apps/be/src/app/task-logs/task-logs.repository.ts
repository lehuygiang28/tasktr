import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { AbstractRepository } from '~be/common/utils/abstract/abstract.repository';

import { TaskLog } from './task-log.schema';
import { NullableType } from '~be/common/utils/types';
import { convertToObjectId } from '~be/common/utils';

export class TaskLogsRepository extends AbstractRepository<TaskLog> {
    protected readonly logger: PinoLogger;

    constructor(
        @InjectModel(TaskLog.name) protected readonly taskLogModel: Model<TaskLog>,
        @InjectConnection() connection: Connection,
    ) {
        super(taskLogModel, connection);
        this.logger = new PinoLogger({
            renameContext: TaskLogsRepository.name,
        });
    }

    async findOldest(filterQuery: FilterQuery<TaskLog>): Promise<NullableType<TaskLog>> {
        const document = await this.model.find(filterQuery).sort({ createdAt: 1 }).limit(1).lean();
        return document[0] ?? null;
    }

    async delete(id: TaskLog['_id']): Promise<void> {
        await this.model.deleteOne({ _id: convertToObjectId(id) });
    }
}
