import { join } from 'node:path';
import { MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { AllConfig } from '~be/app/config';
import { TTransport } from './types/mailer.type';

@Injectable()
export class MailerConfig implements MailerOptionsFactory {
    constructor(private readonly configService: ConfigService<AllConfig>) {}

    private readonly DEFAULT_SENDER = this.configService.get('mail.sender', {
        infer: true,
    });

    public readonly SendGridTransport: TTransport = {
        host: this.configService.getOrThrow('mail.sendgridHost', { infer: true }),
        secure: true,
        auth: {
            user: this.configService.getOrThrow('mail.sendgridUser', { infer: true }),
            pass: this.configService.getOrThrow('mail.sendgridPassword', { infer: true }),
        },
    };

    public readonly ResendTransport: TTransport = {
        host: this.configService.getOrThrow('mail.resendHost', { infer: true }),
        secure: true,
        auth: {
            user: this.configService.getOrThrow('mail.resendUser', { infer: true }),
            pass: this.configService.getOrThrow('mail.resendApiKey', { infer: true }),
        },
    };

    public readonly GmailTransport: TTransport = {
        host: this.configService.getOrThrow('mail.gmailHost', { infer: true }) ?? 'smtp.gmail.com',
        secure: true,
        auth: {
            user: this.configService.getOrThrow('mail.gmailUser', { infer: true }),
            pass: this.configService.getOrThrow('mail.gmailPassword', { infer: true }),
        },
    };

    public buildMailerOptions(transport: TTransport) {
        return {
            transport,
            defaults: {
                from: this.DEFAULT_SENDER,
            },
            template: {
                dir: join(
                    __dirname,
                    this.configService.getOrThrow('app.deployEnv', { infer: true }) === 'serverless'
                        ? `templates`
                        : `assets/mail/templates`,
                ),
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
