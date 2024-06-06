import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AbstractDocument } from '~be/common/utils';
import type { NullableType } from '~be/common/utils/types';
import { HttpMethodEnum } from '../tasks.enum';
import { User } from '~be/app/users/schemas';

export class AlertSchema {
    @Prop({ required: false, default: 0, type: Number })
    failure: number;
}

@Schema({
    timestamps: true,
    collection: 'tasks',
})
export class Task extends AbstractDocument {
    constructor(data?: NullableType<Task>) {
        super();
        Object.assign(this, data);
    }

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    userId: Types.ObjectId;

    @Prop({ unique: true, required: true, type: String })
    name: string;

    @Prop({ required: false, default: '', type: String })
    note: string;

    @Prop({ required: true, type: String })
    cron: string;

    @Prop({ required: true, type: Array<string>, default: [] })
    cronHistory: string[];

    @Prop({ required: true, type: String })
    endpoint: string;

    @Prop({ required: true, type: String, enum: HttpMethodEnum })
    method: string;

    @Prop({ required: false, default: '', type: String })
    headers: string;

    @Prop({ required: false, default: '', type: String })
    body: string;

    @Prop({ required: false, default: '', type: String })
    timezone: string;

    @Prop({ required: false, type: AlertSchema })
    alert: AlertSchema;

    @Prop({ required: false, default: false, type: Boolean })
    isEnable: boolean;

    @Prop({ required: false, default: new Date() })
    createdAt?: Date;

    @Prop({ required: false, default: new Date() })
    updatedAt?: Date;
}

const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = HydratedDocument<Task>;

TaskSchema.index({ userId: 1, name: 1 }, { unique: true });

export { TaskSchema };
