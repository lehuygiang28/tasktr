import { ApiProperty } from '@nestjs/swagger';
import { TaskDto } from './task.dto';

export class GetTasksResponseDto {
    @ApiProperty({ type: [TaskDto] })
    data: TaskDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;
}
