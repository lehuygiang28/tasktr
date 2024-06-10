import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { GMAIL_TRANSPORT, RESEND_TRANSPORT, SENDGRID_TRANSPORT } from './mail.constant';
import { MailerConfig } from './mail.config';
import { I18nService } from 'nestjs-i18n';
import { MailData } from './mail-data.interface';
import { PinoLogger } from 'nestjs-pino';
import { Attachment } from 'nodemailer/lib/mailer';
import { I18nTranslations } from '../i18n';
import type { MaybeType } from '../utils/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly i18n: I18nService<I18nTranslations>,
    ) {
        const mailConfig = new MailerConfig(this.configService);
        this.mailerService.addTransporter(SENDGRID_TRANSPORT, mailConfig.SendGridTransport);
        this.mailerService.addTransporter(RESEND_TRANSPORT, mailConfig.ResendTransport);
        this.mailerService.addTransporter(GMAIL_TRANSPORT, mailConfig.GmailTransport);

        this.logger.setContext(MailService.name);
        this.BASE_ATTACHMENT = [
            // {
            //     filename: 'giaang.png',
            //     path: join(__dirname, 'assets/mail/templates/assets/images/giaang.png'),
            //     cid: 'giaang',
            // },
        ];
    }

    private readonly TRANSPORTERS = [SENDGRID_TRANSPORT, RESEND_TRANSPORT, GMAIL_TRANSPORT];
    private readonly MAX_RETRIES = this.TRANSPORTERS.length;
    private readonly BASE_ATTACHMENT: Attachment[] = [];

    private resolveTransporter(transporter = SENDGRID_TRANSPORT) {
        if (!this.TRANSPORTERS.includes(transporter)) {
            transporter = SENDGRID_TRANSPORT;
        }

        return transporter;
    }

    private getNextTransporter(currentTransporter: string): string {
        const currentIndex = this.TRANSPORTERS.indexOf(currentTransporter);
        if (currentIndex === -1 || currentIndex === this.TRANSPORTERS.length - 1) {
            return this.TRANSPORTERS[0];
        } else {
            return this.TRANSPORTERS[currentIndex + 1];
        }
    }

    async sendConfirmMail(
        data: {
            to: string;
            mailData: {
                url: string;
            };
            isResend?: boolean;
        },
        retryData: {
            retryCount?: number;
            transporter?: string;
        } = { retryCount: 0, transporter: SENDGRID_TRANSPORT },
    ): Promise<unknown> {
        const { to, isResend = false, mailData } = data;

        let { transporter = SENDGRID_TRANSPORT } = retryData;
        const { retryCount = 0 } = retryData;

        let emailConfirmTitle: MaybeType<string>;
        let text1: MaybeType<string>;
        let text2: MaybeType<string>;
        let text3: MaybeType<string>;
        let btn1: MaybeType<string>;

        if (retryCount > this.MAX_RETRIES) {
            this.logger.debug(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        if (isResend) {
            emailConfirmTitle = this.i18n.t('mail-context.RESEND_CONFIRM_EMAIL.title');
            text1 = this.i18n.t('mail-context.RESEND_CONFIRM_EMAIL.text1');
            text2 = this.i18n.t('mail-context.RESEND_CONFIRM_EMAIL.text2');
            text3 = this.i18n.t('mail-context.RESEND_CONFIRM_EMAIL.text3');
            btn1 = this.i18n.t('mail-context.RESEND_CONFIRM_EMAIL.btn1');
        } else {
            emailConfirmTitle = this.i18n.t('mail-context.CONFIRM_EMAIL.title');
            text1 = this.i18n.t('mail-context.CONFIRM_EMAIL.text1');
            text2 = this.i18n.t('mail-context.CONFIRM_EMAIL.text2');
            text3 = this.i18n.t('mail-context.CONFIRM_EMAIL.text3');
            btn1 = this.i18n.t('mail-context.CONFIRM_EMAIL.btn1');
        }

        this.logger.debug(
            JSON.stringify({
                emailConfirmTitle,
                text1,
                text2,
                text3,
                btn1,
            }),
            'mail text',
        );

        const transporterName = this.resolveTransporter(transporter);
        this.logger.debug(`Sending confirm mail to ${to} with transporter: ${transporterName}`);
        return this.mailerService
            .sendMail({
                transporterName,
                to: to,
                subject: emailConfirmTitle,
                template: 'confirm-email',
                attachments: this.BASE_ATTACHMENT,
                context: {
                    title: emailConfirmTitle,
                    url: mailData.url.toString(),
                    text1,
                    text2,
                    text3,
                    btn1,
                },
            })
            .then(() => {
                this.logger.debug(`Mail sent: ${to}`);
            })
            .catch(async (error) => {
                this.logger.debug(`Send mail failed: ${error.message}`);
                transporter = this.getNextTransporter(transporterName);
                this.logger.debug(`Retry send mail with transporter: ${transporter}`);
                await this.sendConfirmMail(
                    {
                        to: to,
                        mailData,
                    },
                    {
                        transporter,
                        retryCount: retryCount + 1,
                    },
                );
            });
    }

    async sendForgotPassword(
        mailData: MailData<{ url: string; tokenExpires: number; returnUrl?: string }>,
        retryData: {
            retryCount?: number;
            transporter?: string;
        } = { retryCount: 0, transporter: SENDGRID_TRANSPORT },
    ) {
        const { to, data } = mailData;

        let { transporter = SENDGRID_TRANSPORT } = retryData;
        const { retryCount = 0 } = retryData;

        if (retryCount > this.MAX_RETRIES) {
            this.logger.debug(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        let resetPasswordTitle: MaybeType<string>;
        let text1: MaybeType<string>;
        let text2: MaybeType<string>;
        let text3: MaybeType<string>;
        let btn1: MaybeType<string>;

        if (this.i18n) {
            [resetPasswordTitle, text1, text2, text3, btn1] = await Promise.all([
                this.i18n.t('mail-context.RESET_PASSWORD.title'),
                this.i18n.t('mail-context.RESET_PASSWORD.text1'),
                this.i18n.t('mail-context.RESET_PASSWORD.text2'),
                this.i18n.t('mail-context.RESET_PASSWORD.text3'),
                this.i18n.t('mail-context.RESET_PASSWORD.btn1'),
            ]);
        }

        const url = new URL(data.url);
        url.searchParams.set('expires', data.tokenExpires.toString());

        const transporterName = this.resolveTransporter(transporter);
        this.logger.debug(`Sending forgot mail to ${to} with transporter: ${transporterName}`);
        return await this.mailerService
            .sendMail({
                transporterName,
                attachments: this.BASE_ATTACHMENT,
                to: to,
                subject: resetPasswordTitle,
                template: 'reset-password',
                context: {
                    title: resetPasswordTitle,
                    url: url.toString(),
                    text1,
                    text2,
                    text3,
                    btn1,
                },
            })
            .then(() => {
                this.logger.debug(`Mail sent: ${to}`);
            })
            .catch(async (error) => {
                this.logger.error(`Send mail failed: ${error.message}`);
                transporter = this.getNextTransporter(transporterName);
                this.logger.debug(`Retry send mail with transporter: ${transporter}`);
                await this.sendForgotPassword(mailData, {
                    transporter: transporter,
                    retryCount: retryCount + 1,
                });
            });
    }

    async sendLogin(
        data: {
            to: string;
            mailData: {
                url: string;
            };
        },
        retryData: {
            retryCount?: number;
            transporter?: string;
        } = { retryCount: 0, transporter: SENDGRID_TRANSPORT },
    ): Promise<unknown> {
        const { to, mailData } = data;

        let { transporter = SENDGRID_TRANSPORT } = retryData;
        const { retryCount = 0 } = retryData;

        let emailConfirmTitle: MaybeType<string>;
        let text1: MaybeType<string>;
        let text2: MaybeType<string>;
        let text3: MaybeType<string>;
        let btn1: MaybeType<string>;

        if (retryCount > this.MAX_RETRIES) {
            this.logger.debug(`Send mail failed: too many retries`);
            return {
                message: 'Failed to send email',
            };
        }

        if (this.i18n) {
            emailConfirmTitle = this.i18n.t('mail-context.LOGIN_EMAIL.title');
            text1 = this.i18n.t('mail-context.LOGIN_EMAIL.text1');
            text2 = this.i18n.t('mail-context.LOGIN_EMAIL.text2');
            text3 = this.i18n.t('mail-context.LOGIN_EMAIL.text3');
            btn1 = this.i18n.t('mail-context.LOGIN_EMAIL.btn1');
        }

        const transporterName = this.resolveTransporter(transporter);
        this.logger.debug(`Sending login mail to ${to} with transporter: ${transporterName}`);
        return this.mailerService
            .sendMail({
                transporterName,
                to: to,
                subject: emailConfirmTitle,
                template: 'login',
                attachments: this.BASE_ATTACHMENT,
                context: {
                    title: emailConfirmTitle,
                    url: mailData.url,
                    app_name: 'TechCell.cloud',
                    text1,
                    text2,
                    text3,
                    btn1,
                },
            })
            .then(() => {
                this.logger.debug(`Mail sent: ${to}`);
            })
            .catch(async (error) => {
                this.logger.debug(`Send mail failed: ${error.message}`);
                transporter = this.getNextTransporter(transporterName);
                this.logger.debug(`Retry send mail with transporter: ${transporter}`);
                await this.sendLogin(
                    {
                        to: to,
                        mailData,
                    },
                    {
                        transporter,
                        retryCount: retryCount + 1,
                    },
                );
            });
    }
}
