import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { AbstractDocument } from '~be/common/utils/abstract/abstract.schema';

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

    @Prop({ required: false, default: new Date() })
    createdAt?: Date;

    @Prop({ required: false, default: new Date() })
    updatedAt?: Date;
}

export const TaskLogSchema = SchemaFactory.createForClass(TaskLog);
export type TaskLogDocument = HydratedDocument<TaskLog>;
