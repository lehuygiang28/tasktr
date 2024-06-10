// import { PinoLogger } from 'nestjs-pino';
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import Strategy from 'passport-magic-login';
// import { AuthService } from '../auth.service';
// import { AuthEmailLoginDto } from '../dtos';
// import { ConfigService } from '@nestjs/config';
// import { MailService } from '~be/common/mail';

// @Injectable()
// export class PasswordlessStrategy extends PassportStrategy(Strategy, 'pwdless') {
//     constructor(
//         private authService: AuthService,
//         private configService: ConfigService,
//         private readonly logger: PinoLogger,
//         private readonly mailerService: MailService,
//     ) {
//         super({
//             secret: configService.getOrThrow<string>('AUTH_PASSWORDLESS_SECRET'),
//             jwtOptions: {
//                 expiresIn: configService.getOrThrow<string>('AUTH_PASSWORDLESS_EXPIRES_IN'),
//             },
//             callbackUrl:
//                 configService.getOrThrow<string>('FE_DOMAIN') +
//                 configService.getOrThrow<string>('FE_LOGIN_PATH'),
//             sendMagicLink: async (destination, href) => {
//                 this.logger.debug(`sending email to ${destination} with Link ${href}`);
//                 await this.mailerService.sendLogin({
//                     to: destination,
//                     mailData: {
//                         href,
//                     },
//                 });
//             },
//             verify: async (payload: AuthEmailLoginDto, callback) =>
//                 callback(null, this.validate(payload)),
//         });
//         this.logger.setContext(PasswordlessStrategy.name);
//     }

//     async validate({ destination }: AuthEmailLoginDto) {
//         const user = await this.authService.requestLoginPwdless({ destination });
//         return user;
//     }
// }
