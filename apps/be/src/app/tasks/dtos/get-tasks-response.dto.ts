import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { TaskDto } from './task.dto';
import { PaginationResponseDto } from '~be/common/utils';

export class GetTasksResponseDto extends IntersectionType(PaginationResponseDto<TaskDto>) {
    @ApiProperty({ type: [TaskDto] })
    data: TaskDto[];
}
