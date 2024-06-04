import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { MongodbModule } from '~be/common/mongodb';
import { LoggerModule } from '~be/common/pino-logger';
import { I18nModule } from '~be/common/i18n';
import { RedisModule } from '~be/common/redis';
import { BULLMQ_BG_JOB_QUEUE, BackgroundProcessor } from '~be/common/bullmq';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        BullModule.registerQueue({
            name: BULLMQ_BG_JOB_QUEUE,
            connection: {
                host: process.env['REDIS_HOST'] ?? '',
                port: Number(process.env['REDIS_PORT']),
                password: process.env['REDIS_PASSWORD'],
            },
        }),
        LoggerModule,
        I18nModule,
        RedisModule,
        MongodbModule,
        AuthModule,
        UsersModule,
        TasksModule,
    ],
    controllers: [AppController],
    providers: [AppService, BackgroundProcessor],
    exports: [BackgroundProcessor],
})
export class AppModule {}
