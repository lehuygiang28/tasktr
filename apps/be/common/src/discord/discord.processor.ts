import { Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleInit, Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';

import { BULLMQ_DISCORD_QUEUE } from '~be/common/bullmq';
import { DiscordService } from './discord.service';
import { DiscordServiceInput, SendDirectMessage, SendMessage } from './discord.type';

export type DiscordJobName = 'sendMessage' | 'sendDirectMessage';

@Processor(BULLMQ_DISCORD_QUEUE)
export class DiscordProcessor extends WorkerHost implements OnModuleInit {
    private readonly logger: Logger;
    constructor(private readonly discordService: DiscordService) {
        super();
        this.logger = new Logger(DiscordProcessor.name);
    }

    onModuleInit() {
        this.logger.log(
            `${DiscordProcessor.name} for ${BULLMQ_DISCORD_QUEUE} is initialized and ready.`,
        );
    }

    async process(job: Job<DiscordServiceInput, unknown, DiscordJobName>) {
        switch (job.name) {
            case 'sendMessage': {
                return this.sendMessage(job as Job<SendMessage>);
            }
            case 'sendDirectMessage': {
                return this.sendDirectMessage(job as Job<SendDirectMessage>);
            }
            default:
                throw new UnrecoverableError(`Process ${job.name} not implemented`);
        }
    }

    private async sendMessage(job: Job<SendMessage>) {
        return this.discordService.sendMessage(job.data);
    }

    private async sendDirectMessage(job: Job<SendDirectMessage>) {
        return this.discordService.sendDirectMessage(job.data);
    }
}
