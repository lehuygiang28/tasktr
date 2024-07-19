import { Types } from 'mongoose';
import { AlertSchema, TaskOptionSchema, Task } from '../schemas/task.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNumber,
    IsString,
    IsBoolean,
    IsOptional,
    ValidateNested,
    IsEnum,
    IsUrl,
    IsTimeZone,
    IsMongoId,
    IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCron, IsObjectString, ToBoolean } from '~be/common/utils';
import { HttpMethodEnum } from '../tasks.enum';

export class AlertDto implements AlertSchema {
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    failures?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    maxDuration?: number;
}

export class TaskOptionDto implements TaskOptionSchema {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => AlertDto)
    @ValidateNested()
    alert?: AlertDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    stopAfterFailures?: number;
}

export class TaskDto implements Task {
    @ApiProperty({ type: String, format: 'ObjectId' })
    @IsMongoId()
    _id: Types.ObjectId;

    @ApiProperty({ type: String, format: 'ObjectId' })
    @IsMongoId()
    userId: Types.ObjectId;

    @ApiProperty({ example: 'Task 1' })
    @IsString()
    name: string;

    @ApiProperty({ enum: HttpMethodEnum, example: HttpMethodEnum.GET })
    @IsString()
    @IsEnum(HttpMethodEnum)
    method: string;

    @ApiProperty({ example: 'http://localhost:3000/ping' })
    @IsString()
    @IsUrl({
        require_protocol: true,
        protocols: ['http', 'https'],
    })
    endpoint: string;

    @ApiProperty({ example: '{ "Content-Type": "application/json" }' })
    @IsOptional()
    @IsObjectString()
    headers: string;

    @ApiProperty({ example: '{ "key": "value" }' })
    @IsOptional()
    @IsString()
    body: string;

    @ApiProperty({ description: 'Cron expression', example: '0 */5 * * * *' })
    @IsString()
    @IsCron()
    cron: string;

    @ApiProperty({ example: 'Asia/Ho_Chi_Minh' })
    @IsOptional()
    @IsString()
    @IsTimeZone()
    timezone: string;

    @ApiProperty({ example: false })
    @ToBoolean()
    @IsBoolean()
    isEnable: boolean;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsString({ each: true })
    cronHistory: string[];

    @ApiPropertyOptional({ example: 'Task 1, run every 5 minutes' })
    @IsOptional()
    @IsString()
    note: string;

    @ApiPropertyOptional({ type: TaskOptionDto })
    @ValidateNested()
    @Type(() => TaskOptionDto)
    @IsOptional()
    options?: TaskOptionDto;

    @ApiPropertyOptional({ type: Date, default: null })
    @IsOptional()
    deletedAt?: Date;

    @ApiProperty()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty()
    @IsOptional()
    updatedAt?: Date;
}
