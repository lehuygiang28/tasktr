import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskLog } from '../task-log.schema';

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

    @ApiProperty({ type: Date, required: false })
    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({ type: Date, required: false })
    @IsDate()
    @IsOptional()
    updatedAt?: Date;
}
