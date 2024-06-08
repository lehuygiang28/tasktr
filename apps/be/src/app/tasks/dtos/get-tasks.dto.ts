import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString, IsNumber, Min } from 'class-validator';

import { TaskDto } from './task.dto';
import { HttpMethodEnum } from '../tasks.enum';
import { Type } from 'class-transformer';

export class GetTasksDto extends PickType(PartialType(TaskDto), [
    'name',
    'endpoint',
    'cron',
    'isEnable',
] as const) {
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

    @ApiPropertyOptional({ description: 'Sort by field', example: 'name' })
    @IsOptional()
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({ description: 'Sort order (asc or desc)', example: 'asc' })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';

    @ApiPropertyOptional({ description: 'Search query across multiple fields' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    limit?: number = 2;
}
