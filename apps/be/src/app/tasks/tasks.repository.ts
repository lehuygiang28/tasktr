import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

import { AbstractRepository } from '~be/common/utils/abstract';
import { Task } from './schemas/task.schema';
import { convertToObjectId } from '~be/common/utils/common';
import { NullableType } from '~be/common/utils/types';

export class TasksRepository extends AbstractRepository<Task> {
    protected readonly logger: PinoLogger;

    constructor(
        @InjectModel(Task.name) protected readonly taskModel: Model<Task>,
        @InjectConnection() connection: Connection,
    ) {
        super(taskModel, connection);
        this.logger = new PinoLogger({
            renameContext: TasksRepository.name,
        });
    }

    async softDelete(id: Task['_id'] | string): Promise<void> {
        await this.model.updateOne({ _id: convertToObjectId(id) }, { deletedAt: new Date() });
    }

    async hardDelete(id: Task['_id'] | string): Promise<void> {
        await this.model.deleteOne({ _id: convertToObjectId(id) });
    }

    async findMany(options: {
        filterQuery: FilterQuery<Task>;
        cursor?: string;
        limit?: number;
    }): Promise<NullableType<Task[]>> {
        const query = this.model.find(options.filterQuery);
        if (options?.cursor) {
            query.skip(1).gt('_id', options.cursor);
        }
        if (options?.limit) {
            query.limit(options.limit);
        }
        return query.lean(true).exec();
    }
}
