import { PickType } from '@nestjs/swagger';
import { TaskLogDto } from '~be/app/task-logs';

export class TryRequestResponseDto extends PickType(TaskLogDto, [
    'endpoint',
    'method',
    'statusCode',
    'responseSizeBytes',
    'timings',
    'request',
    'response',
    'errorMessage',
]) {
    constructor(data: TryRequestResponseDto) {
        super(data);
        Object.assign(this, data);
    }
}
