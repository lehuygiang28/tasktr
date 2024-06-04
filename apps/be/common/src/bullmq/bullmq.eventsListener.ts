import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { BULLMQ_TASK_QUEUE } from './bullmq.constant';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
@QueueEventsListener(BULLMQ_TASK_QUEUE)
export class BullMQEventsListener extends QueueEventsHost implements OnModuleInit {
    constructor(private readonly logger: PinoLogger) {
        super();
        this.logger.setContext(BullMQEventsListener.name);
    }

    onModuleInit() {
        this.logger.debug(
            `BullMQEventsListener for ${BULLMQ_TASK_QUEUE} is initialized and ready.`,
        );
    }

    @OnQueueEvent('active')
    onActive(
        args: {
            jobId: string;
            prev?: string;
        },
        id: string,
    ) {
        this.logger.info(
            `Active event on ${BULLMQ_TASK_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
        );
    }

    @OnQueueEvent('completed')
    onCompleted(
        args: {
            jobId: string;
            returnvalue: string;
            prev?: string;
        },
        id: string,
    ) {
        this.logger.info(
            `Completed event on ${BULLMQ_TASK_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
        );
    }

    @OnQueueEvent('failed')
    onFailed(
        args: {
            jobId: string;
            failedReason: string;
            prev?: string;
        },
        id: string,
    ) {
        this.logger.info(
            `Failed event on ${BULLMQ_TASK_QUEUE} with id: ${id} and args: ${JSON.stringify(args)}`,
        );
    }
}
