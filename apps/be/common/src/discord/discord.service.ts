import { Injectable } from '@nestjs/common';
import { Client, TextChannel } from 'discord.js';

import { SendDirectMessage, SendMessage } from './discord.type';

@Injectable()
export class DiscordService {
    constructor(private readonly client: Client) {}

    async sendMessage(data: SendMessage) {
        const { message, channelId } = data;
        const channel = this.client.channels.cache.get(channelId) as TextChannel;
        if (channel) {
            await channel?.send(message);
        }
    }

    async sendDirectMessage(data: SendDirectMessage) {
        const { message, dmUserId } = data;
        const user = await this.client.users.fetch(dmUserId);
        if (user) {
            await user.send(message);
        }
    }
}
