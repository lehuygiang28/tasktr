import { OmitType } from '@nestjs/swagger';
import { TaskLog } from '../task-log.schema';

export class CreateTaskLogDto extends OmitType(TaskLog, ['_id', 'createdAt', 'updatedAt']) {}
