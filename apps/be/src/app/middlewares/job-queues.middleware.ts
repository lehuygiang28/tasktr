import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import {
    BULLMQ_TASK_QUEUE,
    BULLMQ_TASK_LOG_QUEUE,
    BULLMQ_CLEAR_TASK_QUEUE,
    BULLMQ_BG_JOB_QUEUE,
} from '~be/common/bullmq/bullmq.constant';

export function jobQueueUIMiddleware(connection: Redis, basePath = '') {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(basePath);

    const queues = [
        BULLMQ_TASK_QUEUE,
        BULLMQ_TASK_LOG_QUEUE,
        BULLMQ_CLEAR_TASK_QUEUE,
        BULLMQ_BG_JOB_QUEUE,
    ].map(
        (queueName) =>
            new BullMQAdapter(
                new Queue(queueName, {
                    connection,
                }),
                {
                    readOnlyMode: true,
                },
            ),
    );

    createBullBoard({
        queues,
        serverAdapter,
        options: {
            uiBasePath: require.resolve(`@bull-board/ui/package.json`).replace('package.json', ''),
            uiConfig: {},
        },
    });

    return serverAdapter.getRouter();
}
