import 'reflect-metadata';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsTimeZone,
    IsUrl,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCron } from '@kovalenko/is-cron';
import type { AlertDto, CreateTaskDto, TaskOptionDto } from '~be/app/tasks/dtos';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';

class AlertValidator implements AlertDto {
    @IsOptional()
    @Type(() => Number)
    failures: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(undefined, { message: 'Please enter a number' })
    maxDuration: number;0
}

class TaskOptionValidator implements TaskOptionDto {
    @IsOptional()
    @Type(() => AlertValidator)
    @ValidateNested()
    alert?: AlertValidator;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(undefined, { message: 'Please enter a number' })
    stopAfterFailures?: number;
}

export class TaskFormValidator implements CreateTaskDto {
    constructor() {
        this.body = '';
        this.headers = '';
        this.timezone = '';
        this.note = '';
        this.isEnable = true;
        this.method = HttpMethodEnum.GET;
        this.cron = '* * * * *';
        this.name = '';
        this.endpoint = '';
        this.options = {};
    }

    @IsNotEmpty({ message: 'Please enter a name of task' })
    name: string;

    @IsNotEmpty()
    @IsUrl(
        {
            require_protocol: true,
            protocols: ['http', 'https'],
        },
        { message: 'Please enter a valid URL, example: https://example.com' },
    )
    endpoint: string;

    @IsEnum(HttpMethodEnum, { message: 'Please select an option' })
    method: string;

    @IsCron({ message: 'Cron expression is not valid' })
    cron: string;

    @IsBoolean({ message: 'Please select an option' })
    isEnable: boolean;

    @IsOptional()
    @IsTimeZone({ message: 'Please enter a time zone' })
    timezone: string;

    @IsOptional()
    @IsString()
    note: string;

    @IsOptional()
    @IsString()
    body: string;

    @IsOptional()
    headers: string;

    @IsOptional()
    @Type(() => TaskOptionValidator)
    @ValidateNested()
    options?: TaskOptionValidator;
}
