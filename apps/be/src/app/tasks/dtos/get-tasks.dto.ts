import { ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';

import { TaskDto } from './task.dto';
import { HttpMethodEnum } from '../tasks.enum';
import { PaginationRequestDto, ToBoolean } from '~be/common/utils';

export class GetTasksDto extends IntersectionType(
    PickType(PartialType(TaskDto), ['name', 'endpoint', 'cron', 'isEnable'] as const),
    PaginationRequestDto,
) {
    @ApiPropertyOptional({
        type: [HttpMethodEnum],
        enum: HttpMethodEnum,
        description: 'Filter by HTTP methods',
        example: [HttpMethodEnum.GET, HttpMethodEnum.POST],
    })
    @IsOptional()
    @IsEnum(HttpMethodEnum, { each: true })
    methods?: HttpMethodEnum[];

    @ApiPropertyOptional({ description: 'Search query across multiple fields' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: false, description: 'Filter deleted tasks' })
    @IsOptional()
    @ToBoolean()
    @IsBoolean()
    isDeleted?: boolean;
}
