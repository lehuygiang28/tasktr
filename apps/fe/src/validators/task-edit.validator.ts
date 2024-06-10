import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsTimeZone,
    IsUrl,
} from 'class-validator';
import { type CreateTaskDto } from '~be/app/tasks/dtos';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';
// import { IsCron } from '~be/common/utils/decorators';
import { IsCron } from '@kovalenko/is-cron';

export class TaskEditValidator implements Omit<CreateTaskDto, 'alert'> {
    constructor(data?: unknown) {
        if (data) {
            this.name = data['name'];
            this.cron = data['cron'];
            this.endpoint = data['endpoint'];
            this.method = data['method'];
            this.isEnable = data['isEnable'];
            this.timezone = data['timezone'];
            this.note = data['note'];
            this.body = data['body'];
            this.headers = data['headers'];
        }
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
