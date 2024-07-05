import { OmitType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

export class TryRequestDto extends OmitType(CreateTaskDto, [
    'options',
    'isEnable',
    'name',
    'note',
    'cron',
    'timezone',
]) {}
