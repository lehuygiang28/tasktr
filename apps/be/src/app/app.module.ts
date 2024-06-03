import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbModule } from '~be/common/mongodb';
import { LoggerModule } from '~be/common/pino-logger';
import { I18nModule } from '~be/common/i18n';
import { RedisModule } from '~be/common/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
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
    providers: [AppService],
})
export class AppModule {}
