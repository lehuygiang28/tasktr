import {
    Injectable,
    OnModuleInit,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';
import ms from 'ms';
import { Queue } from 'bullmq';
import { faker } from '@faker-js/faker';
import { OAuth2Client } from 'google-auth-library';

import { InjectBgJobQueue } from '~be/common/bullmq';
import { RedisService } from '~be/common/redis';
import { convertToObjectId, getGravatarUrl, NullableType } from '~be/common/utils';
import { MailJobName } from '~be/common/mail';
import { UsersService, UserDto, UserRoleEnum } from '~be/app/users';

import {
    AuthLoginGithubDto,
    AuthLoginGoogleDto,
    AuthLoginPasswordlessDto,
    AuthSignupDto,
    LoginResponseDto,
} from './dtos';
import { JwtPayloadType } from './strategies/types';
import { User } from '../users/schemas';
import { Octokit } from '@octokit/rest';
import { type AllConfig } from '../config';

@Injectable()
export class AuthService implements OnModuleInit {
    private readonly googleClient: OAuth2Client;
    private readonly octokit: Octokit;

    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService<AllConfig>,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly redisService: RedisService,
        @InjectBgJobQueue() private readonly bgQueue: Queue<unknown, unknown, MailJobName>,
    ) {
        this.logger.setContext(AuthService.name);
        this.googleClient = new OAuth2Client(
            this.configService.getOrThrow('auth.googleId', { infer: true }),
            this.configService.getOrThrow('auth.googleSecret', { infer: true }),
        );
        this.octokit = new Octokit({});
    }

    async onModuleInit() {
        const adminEmail = this.configService.get('auth.adminEmail', { infer: true });
        if (!adminEmail) {
            return;
        }

        const adminFound = await this.usersService.findByEmail(adminEmail);
        if (!adminFound) {
            await this.createAdminUser(adminEmail);
            return;
        }

        if (adminFound.role === UserRoleEnum.Admin) {
            this.logger.info(`Admin user with email: "${adminEmail}" already exists`);
            return;
        }

        if (this.configService.get('auth.forceAdminEmail', { infer: true })) {
            adminFound.role = UserRoleEnum.Admin;
            await this.usersService.update(adminFound._id, { role: UserRoleEnum.Admin });
            this.logger.info(`Updated admin user with email: ${adminEmail}`);
            return;
        }

        this.logger.error(
            `User with email: "${adminEmail}" already exists but not admin, please check again or change ADMIN_EMAIL in environment variables`,
        );
        return;
    }

    private async createAdminUser(adminEmail: string) {
        const adminCreate = await this.usersService.usersRepository.create({
            document: {
                email: adminEmail,
                emailVerified: true,
                fullName: 'Admin',
                avatar: {
                    url: getGravatarUrl(adminEmail),
                },
                password: '',
                role: UserRoleEnum.Admin,
            },
        });

        if (adminCreate) {
            this.logger.info(`Created admin user with email: ${adminEmail}`);
        }
    }

    async register(dto: AuthSignupDto): Promise<void> {
        if (await this.usersService.findByEmail(dto.email)) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'emailAlreadyExists',
                },
                message: 'Email already exists',
            });
        }

        const userCreated = await this.usersService.create({
            ...dto,
            email: dto.email,
            emailVerified: false,
            fullName: dto?.fullName || faker.person.fullName(),
            avatar: {
                url: getGravatarUrl(dto.email),
            },
        });

        const key = `auth:confirmEmailHash:${userCreated._id.toString()}`;
        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: userCreated._id,
                email: userCreated.email,
            },
            {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true,
                }),
                expiresIn: this.configService.getOrThrow('auth.confirmEmailTokenExpiresIn', {
                    infer: true,
                }),
            },
        );

        const urlInMail = new URL(dto.returnUrl);
        urlInMail.searchParams.set('hash', hash);

        const data = await Promise.all([
            this.redisService.set(
                key,
                { hash },
                ms(
                    this.configService
                        .getOrThrow('auth.confirmEmailTokenExpiresIn', {
                            infer: true,
                        })
                        .toString(),
                ),
            ),
            this.bgQueue.add(
                'sendEmailRegister',
                { email: userCreated.email, url: urlInMail.toString() },
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                    keepLogs: 20,
                },
            ),
        ]);
        this.logger.debug(data);
    }

    async registerConfirm(hash: string): Promise<void> {
        let userId: UserDto['_id'];

        let jwtData: {
            confirmEmailUserId: UserDto['_id'];
            email: UserDto['email'];
        };
        try {
            jwtData = await this.jwtService.verifyAsync<{
                confirmEmailUserId: UserDto['_id'];
                email: UserDto['email'];
            }>(hash, {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', { infer: true }),
            });

            userId = jwtData.confirmEmailUserId;
        } catch (error) {
            this.logger.debug(error);
            throw new UnprocessableEntityException({
                errors: {
                    hash: `invalidHash`,
                },
                message: 'Your confirmation link is invalid',
            });
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnprocessableEntityException({
                errors: {
                    user: 'userNotFound',
                },
                message: `User with email '${jwtData?.email}' doesn't require registration`,
            });
        }

        const key = `auth:confirmEmailHash:${user._id.toString()}`;
        if (!(await this.redisService.existsUniqueKey(key))) {
            throw new UnprocessableEntityException({
                errors: {
                    hash: `invalidHash`,
                },
                message: 'Your confirmation link is invalid',
            });
        }

        if (user.emailVerified === true) {
            throw new UnprocessableEntityException({
                errors: {
                    user: 'alreadyConfirmed',
                },
                message: `User with email '${userId}' already confirmed`,
            });
        }

        await Promise.all([
            this.redisService.del(key),
            this.usersService.update(user._id, { ...user, emailVerified: true }),
        ]);
    }

    async requestLoginPwdless({ email, returnUrl }: AuthLoginPasswordlessDto): Promise<'OK'> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'notFound',
                },
                message: `User with email '${email}' doesn't exist`,
            });
        }

        if (user?.block?.isBlocked) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'blocked',
                },
                message: `User with email '${email}' is blocked`,
            });
        }

        const key = `auth:requestLoginPwdlessHash:${user._id.toString()}`;
        const hash = await this.jwtService.signAsync(
            {
                userId: user._id,
                email: user.email,
            },
            {
                secret: this.configService.getOrThrow('auth.passwordlessSecret', { infer: true }),
                expiresIn: this.configService.getOrThrow('auth.passwordlessExpiresIn', {
                    infer: true,
                }),
            },
        );

        const urlInMail = new URL(returnUrl);
        urlInMail.searchParams.set('hash', hash);

        const data = await Promise.all([
            this.redisService.set(
                key,
                { hash, userId: user._id.toString() },
                ms(
                    this.configService
                        .getOrThrow('auth.confirmEmailTokenExpiresIn', {
                            infer: true,
                        })
                        .toString(),
                ),
            ),
            this.bgQueue.add(
                'sendEmailLogin',
                { email: user.email, url: urlInMail.toString() },
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                    keepLogs: 20,
                },
            ),
        ]);
        this.logger.debug(data);
        return 'OK';
    }

    async validateRequestLoginPwdless(hash: string): Promise<LoginResponseDto> {
        let userId: UserDto['_id'];
        let jwtData: { hash: string; userId: string };

        // Validate jwt, then get userId, jwtData
        try {
            jwtData = await this.jwtService.verifyAsync<{ hash: string; userId: string }>(hash, {
                secret: this.configService.getOrThrow('auth.passwordlessSecret', { infer: true }),
            });
            userId = convertToObjectId(jwtData.userId);
        } catch (error) {
            this.logger.debug(error);
            throw new UnprocessableEntityException({
                errors: {
                    hash: `invalidHash`,
                },
                message: 'Your login link is expired or invalid',
            });
        }

        // Check user
        const user = await this.usersService.findByIdOrThrow(userId);

        if (user?.block?.isBlocked) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'blocked',
                },
                message: `User with email '${user.email}' is blocked`,
            });
        }

        // Get the hash is saved into redis
        const key = `auth:requestLoginPwdlessHash:${user._id.toString()}`;
        const hashData = await this.redisService.get<
            NullableType<{
                hash: string;
                userId: string;
            }>
        >(key);

        // Compare the hash
        // Ensure one time use only
        if (hashData?.hash !== hash) {
            throw new UnprocessableEntityException({
                errors: {
                    hash: `invalidHash`,
                },
                message: 'Your login link is expired or invalid',
            });
        }

        const promise: (Promise<LoginResponseDto> | Promise<number> | Promise<User>)[] = [
            this.generateTokens(user),
            this.redisService.del(key),
        ];

        if (!user.emailVerified) {
            promise.push(this.usersService.update(user._id, { ...user, emailVerified: true }));
        }

        const [token] = await Promise.all(promise);
        return token as LoginResponseDto;
    }

    async validateLoginGoogle({ idToken }: AuthLoginGoogleDto) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken: idToken,
            audience: [this.configService.getOrThrow('auth.googleId', { infer: true })],
        });
        const data = ticket.getPayload();

        if (!data) {
            throw new UnauthorizedException({
                errors: {
                    google: 'wrongIdToken',
                },
                message: 'Google login failed',
            });
        }

        let user = await this.usersService.findByEmail(data.email);
        if (!user) {
            user = await this.usersService.create({
                email: data.email,
                fullName: data.name,
                avatar: {
                    url: data?.picture,
                },
                emailVerified: true,
            });
        }

        if (!user.emailVerified) {
            user = await this.usersService.update(user._id, { ...user, emailVerified: true });
        }

        return this.generateTokens(user);
    }

    async validateLoginGithub({ accessToken }: AuthLoginGithubDto) {
        const data = await this.octokit.request('GET /user', {
            headers: {
                authorization: `token ${accessToken}`,
            },
        });

        if (!data) {
            throw new UnauthorizedException({
                errors: {
                    github: 'wrongAccessToken',
                },
                message: 'Github login failed',
            });
        }

        const { data: usrGithub } = data;
        let user = await this.usersService.findByEmail(usrGithub.email);
        if (!user) {
            user = await this.usersService.create({
                email: usrGithub.email,
                fullName: usrGithub.name,
                avatar: {
                    url: usrGithub?.avatar_url,
                },
                emailVerified: true,
            });
        }

        if (!user.emailVerified) {
            user = await this.usersService.update(user._id, { ...user, emailVerified: true });
        }

        return this.generateTokens(user);
    }

    async generateTokens(user: UserDto): Promise<LoginResponseDto> {
        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    userId: user._id.toString(),
                    role: user.role,
                    email: user.email,
                } as Omit<JwtPayloadType, 'iat' | 'exp'>,
                {
                    secret: this.configService.getOrThrow('auth.jwtSecret', { infer: true }),
                    expiresIn: this.configService.getOrThrow('auth.jwtTokenExpiresIn', {
                        infer: true,
                    }),
                },
            ),
            await this.jwtService.signAsync(
                {
                    userId: user._id.toString(),
                    role: user.role,
                    email: user.email,
                } as Omit<JwtPayloadType, 'iat' | 'exp'>,
                {
                    secret: this.configService.getOrThrow('auth.refreshSecret', { infer: true }),
                    expiresIn: this.configService.getOrThrow('auth.refreshTokenExpiresIn', {
                        infer: true,
                    }),
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
            ...user,
        };
    }

    async refreshToken({ email }: JwtPayloadType): Promise<LoginResponseDto> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'notFound',
                },
                message: `User with email '${email}' doesn't exist`,
            });
        }

        if (user?.block?.isBlocked) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'blocked',
                },
                message: `User with email '${email}' is blocked`,
            });
        }
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return { accessToken, refreshToken, ...user };
    }
}
