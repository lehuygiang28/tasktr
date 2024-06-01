import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas';
import { UsersRepository } from './users.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [UsersRepository],
})
export class UsersModule {}
