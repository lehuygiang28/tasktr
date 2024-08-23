import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { type Timings } from '@szmarczak/http-timer';
import { HydratedDocument, Types } from 'mongoose';

import { AbstractDocument } from '~be/common/utils/abstract/abstract.schema';

type Phases = Timings['phases'];

export class LogTimingPhases implements Phases {
    @Prop({ type: Number, required: false, default: 0 })
    wait?: number;

    @Prop({ type: Number, required: false, default: 0 })
    dns?: number;

    @Prop({ type: Number, required: false, default: 0 })
    tcp?: number;

    @Prop({ type: Number, required: false, default: 0 })
    tls?: number;

    @Prop({ type: Number, required: false, default: 0 })
    request?: number;

    @Prop({ type: Number, required: false, default: 0 })
    firstByte?: number;

    @Prop({ type: Number, required: false, default: 0 })
    download?: number;

    @Prop({ type: Number, required: false, default: 0 })
    total?: number;
}

export class RequestObject extends Object {
    @Prop({ required: false, type: Object })
    headers?: Record<string, unknown>;

    @Prop({ required: false, type: String, default: '' })
    body?: string;
}

export class ResponseObject extends IntersectionType(
    Object,
    PickType(RequestObject, ['headers', 'body']),
) {}

@Schema({
    timestamps: true,
    collection: 'taskLogs',
})
export class TaskLog extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
    taskId: Types.ObjectId;

    @Prop({ required: true, type: String })
    endpoint: string;

    @Prop({ required: true, type: String })
    method: string;

    @Prop({ required: true, type: String })
    timezone: string;

    @Prop({ required: true, type: Number })
    statusCode: number;

    @Prop({ required: true, type: Number })
    duration: number;

    @Prop({ required: true, type: Number })
    responseSizeBytes: number;

    @Prop({ required: true, type: Date })
    scheduledAt: Date;

    @Prop({ required: true, type: Date })
    executedAt: Date;

    @Prop({ required: false, default: 'default' })
    workerName: string;

    @Prop({ required: false, type: LogTimingPhases })
    timings?: LogTimingPhases;

    @Prop({ required: false, type: RequestObject })
    request?: RequestObject;

    @Prop({ required: false, type: ResponseObject })
    response?: ResponseObject;

    @Prop({ required: false, type: String, default: null })
    errorMessage?: string;

    @Prop({ required: false, default: new Date() })
    createdAt?: Date;

    @Prop({ required: false, default: new Date() })
    updatedAt?: Date;
}

export const TaskLogSchema = SchemaFactory.createForClass(TaskLog);
export type TaskLogDocument = HydratedDocument<TaskLog>;
