import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { PinoLogger } from 'nestjs-pino';
import ms from 'ms';
import { Queue } from 'bullmq';
import { faker } from '@faker-js/faker';

import { BackgroundJobName, BULLMQ_BG_JOB_QUEUE } from '~be/common/bullmq';
import { RedisService } from '~be/common/redis';

import { UsersService, UserRoleEnum, UserDto } from '~be/app/users';

import { AuthLoginPasswordlessDto, AuthSignupDto, LoginResponseDto } from './dtos';
import { JwtPayloadType } from './strategies/types';
import { convertToObjectId, NullableType } from '~be/common/utils';
import { User } from '../users/schemas';

@Injectable()
export class AuthService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly redisService: RedisService,
        @InjectQueue(BULLMQ_BG_JOB_QUEUE)
        readonly bgQueue: Queue<unknown, unknown, BackgroundJobName>,
    ) {
        this.logger.setContext(AuthService.name);
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

        const userCreated = await this.usersService.usersRepository.create({
            document: {
                ...dto,
                email: dto.email,
                emailVerified: false,
                fullName: dto?.fullName || faker.person.fullName(),
                role: UserRoleEnum.Customer,
                password: '',
            },
        });

        const key = `auth:confirmEmailHash:${userCreated._id.toString()}`;
        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: userCreated._id,
                email: userCreated.email,
            },
            {
                secret: this.configService.getOrThrow('AUTH_CONFIRM_EMAIL_SECRET'),
                expiresIn: this.configService.getOrThrow<string>(
                    'AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN',
                ),
            },
        );

        const urlInMail = new URL(dto.returnUrl);
        urlInMail.searchParams.set('hash', hash);

        const data = await Promise.all([
            this.redisService.set(
                key,
                { hash },
                ms(this.configService.getOrThrow<string>('AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN')),
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
                secret: this.configService.getOrThrow('AUTH_CONFIRM_EMAIL_SECRET'),
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
                secret: this.configService.getOrThrow('AUTH_PASSWORDLESS_SECRET'),
                expiresIn: this.configService.getOrThrow<string>('AUTH_PASSWORDLESS_EXPIRES_IN'),
            },
        );

        const urlInMail = new URL(returnUrl);
        urlInMail.searchParams.set('hash', hash);

        const data = await Promise.all([
            this.redisService.set(
                key,
                { hash, userId: user._id.toString() },
                ms(this.configService.getOrThrow<string>('AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN')),
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
                secret: this.configService.getOrThrow('AUTH_PASSWORDLESS_SECRET'),
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

    async generateTokens(user: UserDto): Promise<LoginResponseDto> {
        const [accessToken, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    userId: user._id.toString(),
                    role: user.role,
                    email: user.email,
                } as Omit<JwtPayloadType, 'iat' | 'exp'>,
                {
                    secret: this.configService.getOrThrow('AUTH_JWT_SECRET'),
                    expiresIn: this.configService.getOrThrow<string>('AUTH_JWT_TOKEN_EXPIRES_IN'),
                },
            ),
            await this.jwtService.signAsync(
                {
                    userId: user._id.toString(),
                    role: user.role,
                    email: user.email,
                } as Omit<JwtPayloadType, 'iat' | 'exp'>,
                {
                    secret: this.configService.getOrThrow('AUTH_REFRESH_SECRET'),
                    expiresIn: this.configService.getOrThrow<string>(
                        'AUTH_REFRESH_TOKEN_EXPIRES_IN',
                    ),
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
