import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractDocument } from '~be/common/utils';

@Schema({
    timestamps: true,
    collection: 'taskLogs',
})
export class TaskLog extends AbstractDocument {
    @Prop({ required: true, type: Types.ObjectId, ref: 'Task' })
    taskId: Types.ObjectId;

    @Prop({ required: false, default: new Date() })
    createdAt?: Date;

    @Prop({ required: false, default: new Date() })
    updatedAt?: Date;
}

export const TaskLogSchema = SchemaFactory.createForClass(TaskLog);
export type TaskLogDocument = HydratedDocument<TaskLog>;
