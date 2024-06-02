import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { Factory } from 'nestjs-seeder';
import { Faker } from '@faker-js/faker';
import { UserRoleEnum } from '../users.enum';
import { UserBlockSchema } from './block.schema';
import { AbstractDocument } from '~be/common/utils';
import type { NullableType } from '~be/common/utils/types';
import { AvatarSchema } from './avatar.schema';
import { IsEmail } from 'class-validator';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
    collection: 'users',
})
export class User extends AbstractDocument {
    constructor(data?: NullableType<User>) {
        super();
        Object.assign(this, data);
    }

    @ApiProperty({
        type: String,
        example: 'example@example.com',
    })
    @Factory((faker: Faker) => faker.internet.email({ provider: 'example.com' }))
    @Prop({ unique: true, required: true })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: false,
    })
    @Prop({ default: false })
    emailVerified: boolean;

    @ApiHideProperty()
    @Exclude({ toPlainOnly: true })
    @Factory((faker: Faker) => faker.internet.password())
    @Prop({ default: '' })
    password: string;

    @ApiProperty({
        example: 'John Doe',
    })
    @Factory((faker: Faker) => faker.person.fullName())
    @Prop({ type: String, required: true })
    fullName: string;

    @ApiPropertyOptional({
        type: AvatarSchema,
    })
    @Prop({ type: AvatarSchema })
    avatar?: AvatarSchema;

    @Expose({ groups: ['me', 'admin'] })
    @ApiProperty({
        example: UserRoleEnum.Customer,
        enum: UserRoleEnum,
        type: String,
    })
    @Factory((faker: Faker) =>
        faker.helpers.arrayElement([UserRoleEnum.Customer, UserRoleEnum.Admin]),
    )
    @Prop({ type: String, enum: UserRoleEnum, required: true })
    role: string;

    @ApiPropertyOptional({
        type: UserBlockSchema,
    })
    @Expose({ groups: [UserRoleEnum.Admin], toPlainOnly: true })
    @Prop({ type: UserBlockSchema, default: {} })
    block?: UserBlockSchema;
}

export const UserSchema = SchemaFactory.createForClass(User);
