import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { MailService } from './mail.service';
import { MailerConfig } from './mail.config';
import { I18nModule } from '../i18n';
import { MailProcessor } from './mail.processor';
import mailConfig from './config/mail-config';

const providers: Provider[] = [MailService, MailerConfig];

if (!(process.env['MAIL_CONCURRENCY'] && Number(process.env['MAIL_CONCURRENCY']) <= 0)) {
    providers.push(MailProcessor);
}

@Module({
    imports: [
        ConfigModule.forFeature(mailConfig),
        I18nModule,
        MailerModule.forRootAsync({
            useClass: MailerConfig,
        }),
    ],
    providers: providers,
    exports: providers,
})
export class MailModule {}
