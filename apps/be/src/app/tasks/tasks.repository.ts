import { AbstractRepository } from '~be/common/utils/abstract';
import { Task } from './schemas/task.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { convertToObjectId } from '~be/common/utils/common';

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
}
