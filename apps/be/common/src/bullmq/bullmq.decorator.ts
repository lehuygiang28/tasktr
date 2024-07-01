import { InjectQueue } from '@nestjs/bullmq';
import {
    BULLMQ_BG_JOB_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_TASK_QUEUE,
} from './bullmq.constant';

export const InjectClearTaskQueue = (): ParameterDecorator => InjectQueue(BULLMQ_CLEAR_TASK_QUEUE);
export const InjectTaskQueue = (): ParameterDecorator => InjectQueue(BULLMQ_TASK_QUEUE);
export const InjectTaskLogQueue = (): ParameterDecorator => InjectQueue(BULLMQ_TASK_LOG_QUEUE);
export const InjectBgJobQueue = (): ParameterDecorator => InjectQueue(BULLMQ_BG_JOB_QUEUE);
export const InjectQueueDecorator = (queueName: string): ParameterDecorator =>
    InjectQueue(queueName);
