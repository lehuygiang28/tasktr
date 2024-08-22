import { MessageCreateOptions, MessagePayload } from 'discord.js';

export type SendMessage = {
    message: string | MessagePayload | MessageCreateOptions;
    channelId: string;
};

export type SendDirectMessage = {
    message: string | MessagePayload | MessageCreateOptions;
    dmUserId: string;
};

export type DiscordServiceInput = SendMessage | SendDirectMessage;
