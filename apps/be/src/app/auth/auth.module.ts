import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';

import { UsersModule } from '~be/app/users';
import { MailModule } from '~be/common/mail';
import { RedisModule } from '~be/common/redis';
import { BackgroundProcessor, BULLMQ_BG_JOB_QUEUE } from '~be/common/bullmq';

import { AuthService } from './auth.service';
import { AnonymousStrategy, JwtRefreshStrategy, JwtStrategy } from './strategies';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        JwtModule.register({}),
        BullModule.registerQueue({
            name: BULLMQ_BG_JOB_QUEUE,
        }),
        PassportModule,
        MailModule,
        RedisModule,
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AnonymousStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        BackgroundProcessor,
    ],
    exports: [AuthService, BackgroundProcessor],
})
export class AuthModule {}
