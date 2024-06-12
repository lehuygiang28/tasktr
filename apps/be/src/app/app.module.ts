import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { MongodbModule } from '~be/common/mongodb';
import { LoggerModule } from '~be/common/pino-logger';
import { I18nModule } from '~be/common/i18n';
import { RedisModule, RedisService } from '~be/common/redis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';

const imports = [
    ConfigModule.forRoot({
        isGlobal: true,
    }),
    RedisModule,
    BullModule.forRootAsync({
        imports: [RedisModule, ConfigModule],
        useFactory: async (redisService: RedisService, configService: ConfigService) => ({
            connection: redisService.getClient,
            streams: {
                events: {
                    maxLen: configService.get<number>('BULLMQ_EVENTS_MAXLEN') || 100,
                },
            },
        }),
        inject: [RedisService, ConfigService],
    }),
    LoggerModule,
    I18nModule,
    MongodbModule,
    UsersModule,
    TasksModule,
];

if (!process?.env?.WORKER_MODE || process.env.WORKER_MODE === 'false') {
    imports.push(AuthModule);
}

@Module({
    imports: imports,
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
