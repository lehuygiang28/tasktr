import { ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';

import { TaskDto } from './task.dto';
import { HttpMethodEnum } from '../tasks.enum';
import { PaginationRequestDto } from '~be/common/utils';

export class GetTasksDto extends IntersectionType(
    PickType(PartialType(TaskDto), ['name', 'endpoint', 'cron', 'isEnable'] as const),
    PaginationRequestDto,
) {
    @ApiPropertyOptional({
        enum: HttpMethodEnum,
        isArray: true,
        example: [HttpMethodEnum.GET, HttpMethodEnum.POST],
        description: 'Filter by HTTP methods',
    })
    @IsOptional()
    @IsArray()
    @IsEnum(HttpMethodEnum, { each: true })
    methods?: HttpMethodEnum[];

    @ApiPropertyOptional({ description: 'Search query across multiple fields' })
    @IsOptional()
    @IsString()
    search?: string;
}
