import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';
import { MailerConfig } from './mail.config';
import { I18nModule } from '../i18n';
import { MailProcessor } from './mail.processor';

@Module({
    imports: [
        I18nModule,
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    providers: [MailProcessor, MailService],
    exports: [MailProcessor, MailService],
})
export class MailModule {}
