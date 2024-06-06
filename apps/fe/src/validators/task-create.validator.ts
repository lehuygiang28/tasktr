import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsTimeZone,
    IsUrl,
} from 'class-validator';
import { CreateTaskDto } from '~be/app/tasks/dtos';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
import { IsCron, IsObjectString } from '~be/common/utils/decorators';

export class TaskCreateValidator implements Omit<CreateTaskDto, 'alert'> {
    @IsNotEmpty({ message: 'Please enter a name of task' })
    name: string;

    @IsNotEmpty()
    @IsUrl(undefined, { message: 'Please enter a url' })
    endpoint: string;

    @IsEnum(HttpMethodEnum, { message: 'Please select an option' })
    method: string;

    @IsCron({ message: 'Cron expression is not valid, see https://crontab.guru' })
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
    @IsObjectString({ message: 'Please enter a valid JSON' })
    headers: string;
}
