import { join } from 'path';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TTransport } from './types/mailer.type';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    private readonly DEFAULT_SENDER =
        this.configService.get<string>('MAIL_SENDER') ?? '<teams@techcell.cloud>';

    public readonly SendGridTransport: TTransport = {
        host: this.configService.get<string>('SENDGRID_HOST') ?? 'smtp.sendgrid.net',
        secure: true,
        auth: {
            user: this.configService.get<string>('SENDGRID_USER') ?? 'apikey',
            pass: this.configService.get<string>('SENDGRID_PASSWORD') ?? '',
        },
    };

    public readonly ResendTransport: TTransport = {
        host: this.configService.get<string>('RESEND_HOST') ?? 'smtp.resend.com',
        secure: true,
        auth: {
            user: this.configService.get<string>('RESEND_USER') ?? 'resend',
            pass: this.configService.get<string>('RESEND_API_KEY') ?? '',
        },
    };

    public readonly GmailTransport: TTransport = {
        host: this.configService.get<string>('GMAIL_HOST') ?? 'smtp.gmail.com',
        secure: true,
        auth: {
            user: this.configService.get<string>('GMAIL_USER') ?? '',
            pass: this.configService.get<string>('GMAIL_PASSWORD') ?? '',
        },
    };

    public buildMailerOptions(transport: TTransport) {
        return {
            transport,
            defaults: {
                from: this.DEFAULT_SENDER,
            },
            template: {
                dir: join(__dirname, `assets/mail/templates`),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        };
    }

    createMailerOptions() {
        return this.buildMailerOptions(this.GmailTransport);
    }
}
