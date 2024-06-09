import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDto<TData> {
    constructor(data: { data: TData[]; total: number; limit: number; page: number }) {
        this.data = data.data;
        this.total = data.total;
        this.limit = data.limit;
        this.page = data.page;
    }

    @ApiProperty()
    data: TData[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    page: number;
}
