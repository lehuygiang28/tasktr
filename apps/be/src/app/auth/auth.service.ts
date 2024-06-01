import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PinoLogger } from 'nestjs-pino';
import {
    AuthEmailLoginDto,
    AuthLoginPasswordlessDto,
    AuthSignupDto,
    LoginResponseDto,
} from './dtos';
import { UserRoleEnum } from '../users/users.enum';
import { faker } from '@faker-js/faker';
import { UserDto } from '../users';
import ms from 'ms';
import * as bcrypt from 'bcryptjs';
import { JwtPayloadType } from './strategies/types';
import { MailService } from '~be/common/mail';
import { RedisService } from '~be/common/redis';

@Injectable()
export class AuthService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService,
        private readonly redisService: RedisService,
    ) {
        this.logger.setContext(AuthService.name);
    }

    async register(dto: AuthSignupDto): Promise<void> {
        this.logger.info(dto);
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
                expiresIn:
                    Date.now() +
                    ms(
                        this.configService.getOrThrow<string>(
                            'AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN',
                        ),
                    ),
            },
        );

        const data = await Promise.allSettled([
            this.redisService.set(
                key,
                { hash },
                ms(this.configService.getOrThrow<string>('AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN')),
            ),
            this.mailService.sendConfirmMail({
                to: userCreated.email,
                mailData: {
                    hash,
                },
            }),
        ]);
        this.logger.debug(data);
    }
    async registerConfirm(hash: string): Promise<void> {
        let userId: UserDto['_id'];

        try {
            const jwtData = await this.jwtService.verifyAsync<{
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
                    users: 'userNotFound',
                },
                message: `User with email '${user.email}' doesn't require registration`,
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

    async validatePasswordless({ destination }: AuthLoginPasswordlessDto): Promise<UserDto> {
        const user = await this.usersService.findByEmail(destination);

        if (!user) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'notFound',
                },
                message: `User with email '${destination}' doesn't exist`,
            });
        }

        if (user?.block?.isBlocked) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'blocked',
                },
                message: `User with email '${destination}' is blocked`,
            });
        }

        return user;
    }

    async validatePassword({
        destination,
        password,
    }: AuthEmailLoginDto): Promise<LoginResponseDto> {
        const user = await this.validatePasswordless({ destination });

        if (!user?.password) {
            throw new UnprocessableEntityException({
                errors: {
                    password: 'notSet',
                },
                message: `User with email '${destination}' doesn't set password up`,
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new UnprocessableEntityException({
                errors: {
                    password: 'invalidPassword',
                },
                message: 'Invalid password',
            });
        }

        const { accessToken, refreshToken } = await this.generateTokens(user);

        return {
            accessToken,
            refreshToken,
            ...user,
        };
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
                    expiresIn:
                        Date.now() +
                        ms(this.configService.getOrThrow<string>('AUTH_JWT_TOKEN_EXPIRES_IN')),
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
                    expiresIn:
                        Date.now() +
                        ms(this.configService.getOrThrow<string>('AUTH_REFRESH_TOKEN_EXPIRES_IN')),
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
            ...user,
        };
    }

    async refreshToken(data: JwtPayloadType): Promise<LoginResponseDto> {
        const user = await this.validatePasswordless({ destination: data.email });
        const { accessToken, refreshToken } = await this.generateTokens(user);
        return { accessToken, refreshToken, ...user };
    }
}
