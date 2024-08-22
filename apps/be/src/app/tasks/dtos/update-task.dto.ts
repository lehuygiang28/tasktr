import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { TaskDto } from './task.dto';

export class UpdateTaskDto extends IntersectionType(
    PartialType(CreateTaskDto),
    PickType(TaskDto, ['deletedAt']),
) {}
