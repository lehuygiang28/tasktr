import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import type { NullableType } from '~be/common/utils/types';
import { convertToObjectId, getGravatarUrl } from '~be/common/utils';

import {
    BlockUserDto,
    CreateUserDto,
    GetUsersDto,
    GetUsersResponseDto,
    UpdateUserDto,
    UserDto,
} from './dtos';
import { UsersRepository } from './users.repository';
import { UserBlockActionEnum, UserRoleEnum } from './users.enum';
import { User } from './schemas';
import { JwtPayloadType } from '../auth';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from '../config';
import { BlockActivityLog } from './schemas/block.schema';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        public readonly usersRepository: UsersRepository,
        private readonly configService: ConfigService<AllConfig>,
    ) {}

    async create(createProfileDto: CreateUserDto): Promise<User> {
        const clonedPayload = {
            ...createProfileDto,
        };

        if (clonedPayload.password) {
            const salt = await bcrypt.genSalt();
            clonedPayload.password = await bcrypt.hash(clonedPayload.password, salt);
        }

        if (clonedPayload.email) {
            const userObject = await this.usersRepository.findOne({
                filterQuery: {
                    email: clonedPayload.email,
                },
            });
            if (userObject) {
                throw new HttpException(
                    {
                        status: HttpStatus.UNPROCESSABLE_ENTITY,
                        errors: {
                            email: 'emailAlreadyExists',
                        },
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }
        }

        const userCreated = await this.usersRepository.create({
            document: {
                ...clonedPayload,
                role: UserRoleEnum.Customer,
                password: clonedPayload?.password ?? null,
                avatar: {
                    url: clonedPayload?.avatar?.url ?? getGravatarUrl(clonedPayload.email),
                },
            },
        });
        return userCreated;
    }

    async findByEmail(email: string): Promise<NullableType<User>> {
        const user = await this.usersRepository.findOne({
            filterQuery: {
                email,
            },
        });
        return user ? new User(user) : null;
    }

    async updateUser({
        actor: _actor,
        userId: _userId,
        data: updateData,
    }: {
        actor: JwtPayloadType;
        userId: string;
        data: UpdateUserDto;
    }) {
        const actor = await this.findByIdOrThrow(_actor.userId);
        const user = await this.findByIdOrThrow(_userId);
        let updateQuery: UpdateUserDto = {};

        if (!this.isAdmin(actor) || this.isSelf(user, actor)) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        email: 'notAllowed',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (updateData?.role) {
            if (updateData.role !== UserRoleEnum.Admin && this.isRootAdmin(user)) {
                throw new HttpException(
                    {
                        status: HttpStatus.UNPROCESSABLE_ENTITY,
                        errors: {
                            email: 'notAllowed',
                        },
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }

            updateQuery = {
                role: updateData.role,
            };
        }

        return this.usersRepository.findOneAndUpdateOrThrow({
            filterQuery: {
                _id: user._id,
            },
            updateQuery,
        });
    }

    async update(
        userId: string | Types.ObjectId,
        payload: Partial<User>,
    ): Promise<NullableType<User>> {
        delete payload?.email;

        if (payload?.password) {
            const salt = await bcrypt.genSalt();
            payload.password = await bcrypt.hash(payload.password, salt);
        }

        const user = await this.usersRepository.findOneAndUpdate({
            filterQuery: {
                _id: convertToObjectId(userId),
            },
            updateQuery: {
                ...payload,
            },
        });
        return user ? new User(user) : null;
    }

    async findById(id: string | Types.ObjectId): Promise<NullableType<User>> {
        const user = await this.usersRepository.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });
        return user ? new User(user) : null;
    }

    async findByIdOrThrow(id: string | Types.ObjectId): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new UnprocessableEntityException({
                errors: {
                    email: 'notFound',
                },
                message: `User with email '${user.email}' is not found`,
            });
        }
        return user;
    }

    async getUsers({ query }: { query: GetUsersDto }): Promise<GetUsersResponseDto> {
        const filter: FilterQuery<UserDto> = {};

        if (query?.emailVerified) {
            filter.emailVerified = query.emailVerified == true || query.emailVerified == 'true'; // cast to boolean
        }

        if (query?.roles?.length > 0) {
            filter.role = { $in: query.roles };
        }

        const [users, total] = await Promise.all([
            this.usersRepository.find({ filterQuery: filter, query }),
            this.usersRepository.count(filter),
        ]);

        return {
            total,
            data: users,
        };
    }

    async getUserById(id: string | Types.ObjectId): Promise<UserDto> {
        return this.usersRepository.findOne({
            filterQuery: {
                _id: convertToObjectId(id),
            },
        });
    }

    async blockUser({
        actor: _actor,
        userId,
        data,
    }: {
        actor: JwtPayloadType;
        userId: string;
        data: BlockUserDto;
    }) {
        const actor = await this.findByIdOrThrow(_actor.userId);
        if (actor.role !== UserRoleEnum.Admin) {
            throw new HttpException(
                {
                    status: HttpStatus.UNAUTHORIZED,
                    errors: {
                        user: 'unauthorized',
                    },
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (actor?.block?.isBlocked) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'alreadyBlocked',
                        forceLogout: true,
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        let user = await this.findByIdOrThrow(userId);
        const canNotBlock = this.configService.get('auth.adminEmail', { infer: true });
        if (canNotBlock && user.email === canNotBlock) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'canNotBlockRootAdmin',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (actor._id === user._id) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'canNotBlockSelf',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (user?.block?.isBlocked) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'alreadyBlocked',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const blockLog: BlockActivityLog = {
            action: UserBlockActionEnum.Block,
            actionAt: new Date(),
            actionBy: actor._id,
            note: data?.note ?? '',
            reason: data.reason,
        };

        user = {
            ...user,
            block: {
                isBlocked: true,
                activityLogs: [...(user?.block?.activityLogs ?? []), blockLog],
            },
        };

        return this.usersRepository.findOneAndUpdate({
            filterQuery: {
                _id: convertToObjectId(userId),
            },
            updateQuery: {
                ...user,
            },
        });
    }

    async unblockUser({ actor: _actor, userId }: { actor: JwtPayloadType; userId: string }) {
        const actor = await this.findByIdOrThrow(_actor.userId);
        if (actor.role !== UserRoleEnum.Admin) {
            throw new HttpException(
                {
                    status: HttpStatus.UNAUTHORIZED,
                    errors: {
                        user: 'unauthorized',
                    },
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (actor?.block?.isBlocked) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'alreadyBlocked',
                        forceLogout: true,
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        let user = await this.findByIdOrThrow(userId);
        if (actor._id === user._id) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'canNotUnblockSelf',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (!user?.block?.isBlocked) {
            throw new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        user: 'alreadyUnblocked',
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const blockLog: BlockActivityLog = {
            action: UserBlockActionEnum.Unblock,
            actionAt: new Date(),
            actionBy: actor._id,
            note: '',
            reason: '',
        };

        user = {
            ...user,
            block: {
                isBlocked: false,
                activityLogs: [...(user?.block?.activityLogs ?? []), blockLog],
            },
        };

        return this.usersRepository.findOneAndUpdate({
            filterQuery: {
                _id: convertToObjectId(userId),
            },
            updateQuery: {
                ...user,
            },
        });
    }

    private readonly isAdmin = (actor: User | UserDto) => actor.role === UserRoleEnum.Admin;

    private readonly isSelf = (actor: User | UserDto, user: User | UserDto) =>
        actor._id === user._id;

    private readonly isRootAdmin = (user: User | UserDto) =>
        user.email === this.configService.get('auth.adminEmail', { infer: true });
}
