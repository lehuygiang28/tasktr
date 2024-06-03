import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { QUEUE_NAME } from './bullmq.constant';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
@QueueEventsListener(QUEUE_NAME)
export class BullMQEventsListener extends QueueEventsHost implements OnModuleInit {
    constructor(private readonly logger: PinoLogger) {
        super();
        this.logger.setContext(BullMQEventsListener.name);
    }

    onModuleInit() {
        this.logger.debug(`BullMQEventsListener for ${QUEUE_NAME} is initialized and ready.`);
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
            `Active event on ${QUEUE_NAME} with id: ${id} and args: ${JSON.stringify(args)}`,
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
            `Completed event on ${QUEUE_NAME} with id: ${id} and args: ${JSON.stringify(args)}`,
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
            `Failed event on ${QUEUE_NAME} with id: ${id} and args: ${JSON.stringify(args)}`,
        );
    }
}
