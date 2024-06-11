import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { RedisService } from './services';

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return new Redis({
                    name: config.get<string>('REDIS_NAME') || 'tasktr_redis_default',
                    host: config.getOrThrow<string>('REDIS_HOST'),
                    port: config.getOrThrow<number>('REDIS_PORT'),
                    password: config.getOrThrow<string>('REDIS_PASSWORD'),
                    connectTimeout: Number(config.get<number>('REDIS_CONNECT_TIMEOUT')) || 20000,
                    maxRetriesPerRequest: null,
                    reconnectOnError: () => {
                        const reconnectAndResendFailedCmd = 2;
                        return reconnectAndResendFailedCmd;
                    },
                } as RedisOptions);
            },
        },
        RedisService,
    ],
    exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
