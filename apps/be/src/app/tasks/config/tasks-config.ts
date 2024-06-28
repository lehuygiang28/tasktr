import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

import validateConfig from '~be/common/utils/validate-config';
import { TasksConfig } from './tasks-config.type';

class EnvironmentVariablesValidator {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    SOFT_DELETE_THRESHOLD_DAYS: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    TASKS_CONCURRENCY: number;
}

export default registerAs<TasksConfig>('tasks', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        softDeleteThresholdDays: process.env?.SOFT_DELETE_THRESHOLD_DAYS
            ? parseInt(process.env?.SOFT_DELETE_THRESHOLD_DAYS, 10)
            : 30,
        tasksConcurrency: process.env?.TASKS_CONCURRENCY
            ? parseInt(process.env?.TASKS_CONCURRENCY, 10)
            : 10,
    };
});
