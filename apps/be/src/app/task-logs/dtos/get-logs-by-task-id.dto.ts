import { IntersectionType } from '@nestjs/swagger';
import { PaginationRequestDto } from '~be/common/utils/dtos';

export class GetLogsByTaskIdDto extends IntersectionType(PaginationRequestDto) {}
