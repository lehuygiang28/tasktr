import { Logger } from 'nestjs-pino';
import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { ResolvePromisesInterceptor, validationOptions } from '~be/common/utils';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const port = process.env.PORT || 8000;

    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const logger = app.get(Logger);

    app.enableCors();
    app.useLogger(app.get(Logger));

    app.use(helmet());
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.useGlobalInterceptors(
        // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
        // https://github.com/typestack/class-transformer/issues/549
        new ResolvePromisesInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
