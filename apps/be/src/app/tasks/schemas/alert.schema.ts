import { Prop } from '@nestjs/mongoose';

export class AlertOnDiscordSchema {
    @Prop({ required: false, type: String, default: null })
    dmUserId?: string;

    @Prop({ required: false, type: String, default: null })
    channelId?: string;
}

export class AlertOnSchema {
    @Prop({ required: false, type: Boolean, default: false })
    email?: boolean;

    @Prop({ required: true, type: AlertOnDiscordSchema })
    discord?: AlertOnDiscordSchema;
}

export class AlertSchema {
    @Prop({ required: false, type: AlertOnSchema })
    alertOn?: AlertOnSchema;

    @Prop({ required: false, type: Boolean, default: false })
    disableByTooManyFailures?: boolean;

    @Prop({ required: false, type: Boolean, default: false })
    jobExecutionFailed?: boolean;
}
