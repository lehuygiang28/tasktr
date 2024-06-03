import { Types } from 'mongoose';
import { AlertSchema, Task } from '../schemas/task.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNumber,
    IsString,
    IsBoolean,
    IsOptional,
    IsObject,
    ValidateNested,
    IsEnum,
    IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCron, ToBoolean } from '~be/common/utils';
import { HttpMethodEnum } from '../tasks.enum';

export class AlertDto implements AlertSchema {
    @ApiProperty()
    @IsNumber()
    failure: number;
}

export class TaskDto implements Task {
    @ApiProperty({ type: String, format: 'ObjectId' })
    _id: Types.ObjectId;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ enum: HttpMethodEnum })
    @IsString()
    @IsEnum(HttpMethodEnum)
    method: string;

    @ApiProperty()
    @IsString()
    @IsUrl()
    endpoint: string;

    @ApiProperty()
    @IsObject()
    headers: Record<string, string>;

    @ApiProperty()
    @IsString()
    body: string;

    @ApiProperty()
    @IsString()
    @IsCron()
    cron: string;

    @ApiProperty()
    @IsString()
    timezone: string;

    @ApiProperty()
    @ToBoolean()
    @IsBoolean()
    isEnable: boolean;

    @ApiProperty({ type: AlertDto })
    @ValidateNested()
    @Type(() => AlertDto)
    alert: AlertDto;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsString({ each: true })
    cronHistory: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty()
    @IsOptional()
    updatedAt?: Date;
}
