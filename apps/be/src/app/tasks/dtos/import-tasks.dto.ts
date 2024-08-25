import { OmitType } from '@nestjs/swagger';

import { TaskDto } from './task.dto';

export class TaskImport extends OmitType(TaskDto, [
    '_id',
    'userId',
    'deletedAt',
    'cronHistory',
    'updatedAt',
    'createdAt',
]) {}

export class ImportTasksDto {
    tasks: TaskImport[];
}
