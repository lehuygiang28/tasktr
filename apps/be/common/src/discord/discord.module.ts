import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';

import { BULLMQ_DISCORD_QUEUE } from '../bullmq';
import { DiscordUpdateService } from './discord-update.service';
import { DiscordService } from './discord.service';
import { DiscordProcessor } from './discord.processor';

@Module({
    imports: [
        NecordModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                token: configService.getOrThrow('DISCORD_BOT_TOKEN', { infer: true }),
                intents: [
                    IntentsBitField.Flags.Guilds,
                    IntentsBitField.Flags.DirectMessages,
                    IntentsBitField.Flags.GuildMessages,
                ],
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: BULLMQ_DISCORD_QUEUE,
        }),
    ],
    providers: [DiscordService, DiscordUpdateService, DiscordProcessor],
    exports: [DiscordService, BullModule],
})
export class DiscordModule {}
