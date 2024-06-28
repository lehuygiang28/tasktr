import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConditionalModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ServeStaticModule } from '@nestjs/serve-static';

import { MongodbModule } from '~be/common/mongodb';
import { LoggerModule } from '~be/common/pino-logger';
import { I18nModule } from '~be/common/i18n';
import { RedisModule, RedisService } from '~be/common/redis';
import { MailModule } from '~be/common/mail';

import appConfig from './config/app-config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { StatsModule } from './stats/stats.module';
import { AppConfigService } from './config/app-config.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'assets', 'public'),
            serveRoot: '/',
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
        MailModule,
        MongodbModule,
        UsersModule,
        TasksModule,
        StatsModule,
        ConditionalModule.registerWhen(
            AuthModule,
            (env: NodeJS.ProcessEnv) => !env?.WORKER_MODE || env?.WORKER_MODE !== 'true',
        ),
    ],
    controllers: [AppController],
    providers: [AppService, AppConfigService],
    exports: [AppConfigService],
})
export class AppModule {}
