import { IntersectionType } from '@nestjs/swagger';
import { PaginationResponseDto } from '~be/common/utils/dtos';
import { TaskLogDto } from './task-log.dto';

export class GetLogsByTaskIdResponseDto extends IntersectionType(
    PaginationResponseDto<TaskLogDto>,
) {}
