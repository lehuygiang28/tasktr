import 'reflect-metadata';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsTimeZone,
    IsUrl,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsCron } from '@kovalenko/is-cron';
import type {
    AlertDto,
    AlertOnDiscordDto,
    AlertOnDto,
    CreateTaskDto,
    TaskOptionDto,
} from '~be/app/tasks/dtos';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';

class AlertOnDiscordValidator implements AlertOnDiscordDto {
    @IsOptional()
    @IsString()
    channelId?: string;

    @IsOptional()
    @IsString()
    dmUserId?: string;
}

class AlertOnValidator implements AlertOnDto {
    @IsOptional()
    @Type(() => AlertOnDiscordValidator)
    discord?: AlertOnDiscordValidator;

    @IsOptional()
    email?: boolean;
}

class AlertValidator implements AlertDto {
    @IsOptional()
    @Type(() => AlertOnValidator)
    alertOn?: AlertOnValidator;

    @IsOptional()
    disableByTooManyFailures?: boolean;

    @IsOptional()
    jobExecutionFailed?: boolean;
}

class TaskOptionValidator implements TaskOptionDto {
    @IsOptional()
    @Type(() => AlertValidator)
    @ValidateNested()
    alert?: AlertValidator;

    @IsOptional()
    @IsNumber(undefined, { message: 'Please enter a number' })
    @IsPositive({ message: 'Please enter a positive number' })
    @Type(() => Number)
    stopAfterFailures?: number;

    @IsOptional()
    saveResponse?: boolean;
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

    @IsOptional()
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
