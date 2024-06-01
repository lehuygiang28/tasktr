import { User } from './schemas';
import { PinoLogger } from 'nestjs-pino';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '~be/common/utils/abstract';

export class UsersRepository extends AbstractRepository<User> {
    protected readonly logger: PinoLogger;

    constructor(
        @InjectModel(User.name) protected readonly userModel: Model<User>,
        @InjectConnection() connection: Connection,
    ) {
        super(userModel, connection);
        this.logger = new PinoLogger({
            renameContext: UsersRepository.name,
        });
    }
}
