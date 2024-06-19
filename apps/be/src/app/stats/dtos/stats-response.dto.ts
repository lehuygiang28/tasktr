import { ApiProperty } from '@nestjs/swagger';
import { TaskLogDto } from '~be/app/task-logs';

export class StatsResponseDto {
    @ApiProperty()
    enableTask: number;

    @ApiProperty()
    disableTask: number;

    @ApiProperty()
    successRate: number;

    @ApiProperty()
    failedRate: number;

    @ApiProperty()
    logs: TaskLogDto[];
}
