import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { LogTimingPhases, RequestObject, ResponseObject, TaskLog } from '../task-log.schema';

export class LogTimingPhasesDto implements LogTimingPhases {
    @ApiProperty({ type: Number, required: false, description: 'The time spent waiting' })
    @IsNumber()
    @IsOptional()
    wait?: number;

    @ApiProperty({ type: Number, required: false, description: 'The time spent on a DNS lookup' })
    @IsNumber()
    @IsOptional()
    dns?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The time spent on establishing a TCP connection',
    })
    @IsNumber()
    @IsOptional()
    tcp?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The time spent on a TLS handshake (only if TLS is used)',
    })
    @IsNumber()
    @IsOptional()
    tls?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The time spent on making the HTTP request',
    })
    @IsNumber()
    @IsOptional()
    request?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The time until the first byte is received',
    })
    @IsNumber()
    @IsOptional()
    firstByte?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The time spent downloading the data',
    })
    @IsNumber()
    @IsOptional()
    download?: number;

    @ApiProperty({
        type: Number,
        required: false,
        description: 'The total time spent on all phases',
    })
    @IsNumber()
    @IsOptional()
    total?: number;
}

export class TaskLogDto implements TaskLog {
    @ApiProperty({ type: String })
    _id: Types.ObjectId;

    @ApiProperty({ type: String })
    taskId: Types.ObjectId;

    @ApiProperty({ type: String })
    @IsString()
    endpoint: string;

    @ApiProperty({ type: String })
    @IsString()
    method: string;

    @ApiProperty({ type: Number })
    @IsNumber()
    duration: number;

    @ApiProperty({ type: Date })
    @IsDate()
    executedAt: Date;

    @ApiProperty({ type: Number })
    @IsNumber()
    responseSizeBytes: number;

    @ApiProperty({ type: Date })
    @IsDate()
    scheduledAt: Date;

    @ApiProperty({ type: Number })
    @IsNumber()
    statusCode: number;

    @ApiProperty({ type: String })
    @IsString()
    workerName: string;

    @ApiProperty({ type: LogTimingPhasesDto, required: false })
    timings?: LogTimingPhasesDto;

    @ApiProperty({ type: RequestObject, required: false })
    request?: RequestObject;

    @ApiProperty({ type: ResponseObject, required: false })
    response?: ResponseObject;

    @ApiProperty({ type: Date, required: false })
    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({ type: Date, required: false })
    @IsDate()
    @IsOptional()
    updatedAt?: Date;
}
