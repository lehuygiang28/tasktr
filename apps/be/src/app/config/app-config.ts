import { registerAs } from '@nestjs/config';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

import validateConfig from '~be/common/utils/validate-config';
import { ToBoolean } from '~be/common/utils/decorators/to-boolean.decorator';
import { removeLeadingAndTrailingSlashes } from '~be/common/utils/common';

import { AppConfig } from './app-config.type';

class EnvironmentVariablesValidator {
    @IsOptional()
    @IsString()
    @IsEnum(['serverless', 'none'])
    DEPLOY_ENV: string;

    @IsOptional()
    @ToBoolean()
    WORKER_MODE: boolean;

    @IsOptional()
    @IsString()
    WORKER_NAME: string;

    @IsOptional()
    @IsString()
    GLOBAL_PREFIX: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    BULLMQ_EVENTS_MAXLEN: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    PORT: number;

    @IsOptional()
    @IsString()
    FALLBACK_LANGUAGE: string;

    @IsOptional()
    @IsString()
    API_STATS_PATH: string;

    @ValidateIf((o: EnvironmentVariablesValidator) => !!o?.API_STATS_PATH)
    @IsString()
    API_STATS_USERNAME: string;

    @ValidateIf((o: EnvironmentVariablesValidator) => !!o?.API_STATS_PATH)
    @IsString()
    API_STATS_PASSWORD: string;

    @IsOptional()
    @IsString()
    BULL_BOARD_PATH: string;
}

export default registerAs<AppConfig>('app', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        deployEnv: process.env?.DEPLOY_ENV || 'none',
        workerMode: process.env?.WORKER_MODE === 'true',
        globalPrefix: process.env?.GLOBAL_PREFIX
            ? removeLeadingAndTrailingSlashes(process.env.GLOBAL_PREFIX)
            : 'api',
        workerName: process.env?.WORKER_NAME || 'default',
        eventsMaxLen: process.env?.BULLMQ_EVENTS_MAXLEN
            ? parseInt(process.env?.BULLMQ_EVENTS_MAXLEN, 10)
            : 100,
        port: process.env?.PORT ? parseInt(process.env?.PORT, 10) : 8000,
        fallbackLanguage: process.env?.FALLBACK_LANGUAGE || 'en',
        apiStatsPath: process.env?.API_STATS_PATH
            ? removeLeadingAndTrailingSlashes(process.env.API_STATS_PATH)
            : '',
        apiStatsUsername: process.env?.API_STATS_USERNAME,
        apiStatsPassword: process.env?.API_STATS_PASSWORD,
        bullBoardPath: process.env?.BULL_BOARD_PATH
            ? removeLeadingAndTrailingSlashes(process.env.BULL_BOARD_PATH)
            : '',
    };
});
