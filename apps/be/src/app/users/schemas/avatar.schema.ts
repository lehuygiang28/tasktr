import { Faker } from '@faker-js/faker';
import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Factory } from 'nestjs-seeder';

export class AvatarSchema {
    @ApiProperty({
        type: String,
        example: 'https://example.com/avatar.png',
    })
    @Factory((faker: Faker) => faker.internet.url())
    @Prop({ required: true })
    url: string;
}
