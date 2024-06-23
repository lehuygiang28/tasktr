import {
    HttpException,
    HttpStatus,
    Injectable,
    UnprocessableEntityException,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import type { NullableType } from '~be/common/utils/types';
import { convertToObjectId, getGravatarUrl } from '~be/common/utils';

import { CreateUserDto, GetUsersDto, GetUsersResponseDto, UserDto } from './dtos';
import { UsersRepository } from './users.repository';
import { UserRoleEnum } from './users.enum';
import { User } from './schemas';

@Injectable()
export class UsersService {
    constructor(public readonly usersRepository: UsersRepository) {}

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
}
