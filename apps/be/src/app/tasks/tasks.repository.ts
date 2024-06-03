import { AbstractRepository } from '~be/common/utils/abstract';
import { Task } from './schemas/task.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';

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
}
