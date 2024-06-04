import { OmitType } from '@nestjs/swagger';
import { TaskDto } from './task.dto';

export class CreateTaskDto extends OmitType(TaskDto, [
    '_id',
    'createdAt',
    'updatedAt',
    'cronHistory',
    'userId',
]) {}
