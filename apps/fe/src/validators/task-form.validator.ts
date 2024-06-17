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
import { IsCron } from '@kovalenko/is-cron';

export class TaskFormValidator implements Omit<CreateTaskDto, 'alert'> {
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
}
