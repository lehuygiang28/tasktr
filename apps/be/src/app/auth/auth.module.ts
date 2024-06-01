import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AnonymousStrategy, JwtStrategy, PasswordlessStrategy } from './strategies';
import { UsersModule } from '../users';
import { MailModule } from '~be/common/mail';
import { RedisModule } from '~be/common/redis';
import { AuthController } from './auth.controller';

@Module({
    imports: [JwtModule.register({}), PassportModule, MailModule, RedisModule, UsersModule],
    controllers: [AuthController],
    providers: [AuthService, AnonymousStrategy, JwtStrategy, PasswordlessStrategy],
    exports: [AuthService],
})
export class AuthModule {}
