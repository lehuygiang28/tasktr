import { Logger } from 'nestjs-pino';
import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import {
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerDocumentOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import * as swaggerStats from 'swagger-stats';

import { AppModule } from './app/app.module';
import {
    ProblemDetails,
    ProblemDetailsFilter,
    ResolvePromisesInterceptor,
    validationOptions,
} from '~be/common/utils';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const port = process.env.PORT || 8000;

    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const configService = app.get(ConfigService);
    const logger = app.get(Logger);

    app.enableCors();
    app.useLogger(app.get(Logger));

    app.use(helmet());
    app.enableShutdownHooks();

    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.useGlobalFilters(new ProblemDetailsFilter());

    app.useGlobalInterceptors(
        // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
        // https://github.com/typestack/class-transformer/issues/549
        new ResolvePromisesInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const swaggerDocumentConfig = new DocumentBuilder()
        .setTitle('Tasktr RESTful API Documentations')
        .setContact('lehuygiang28', 'https://giaang.id.vn', 'lehuygiang28@gmail.com')
        .setDescription('The documentations of the Tasktr RESTful API')
        .setVersion('0.0.1')
        .setLicense(
            'MIT LICENSE',
            'https://github.com/TechCell-Project/the-next-server?tab=MIT-1-ov-file',
        )
        .setExternalDoc('Tasktr Github', 'https://github.com/lehuygiang28/tasktr')
        .addServer('http://localhost:8000')
        .addBearerAuth()
        .build();

    const swaggerDocumentOptions: SwaggerDocumentOptions = { extraModels: [ProblemDetails] };
    const document = SwaggerModule.createDocument(
        app,
        swaggerDocumentConfig,
        swaggerDocumentOptions,
    );
    const swaggerCustomOptions: SwaggerCustomOptions = {
        customSiteTitle: 'Tasktr RESTful API documentations',
        customCss: new SwaggerTheme().getBuffer(SwaggerThemeNameEnum.NORD_DARK),
        customfavIcon: `${configService.get('FE_DOMAIN')}/favicon.ico`,
    };
    SwaggerModule.setup('docs', app, document, swaggerCustomOptions);

    if (configService.get('API_STATS_PATH')) {
        app.use(
            swaggerStats.getMiddleware({
                uriPath: configService.getOrThrow<string>('API_STATS_PATH'),
                swaggerSpec: document,
                name: 'Tasktr API statistics',
                timelineBucketDuration: 180000,
                authentication: true,
                async onAuthenticate(req, username, password) {
                    if (
                        username === configService.getOrThrow<string>('API_STATS_USERNAME') &&
                        password === configService.getOrThrow<string>('API_STATS_PASSWORD')
                    ) {
                        return true;
                    }

                    return false;
                },
            }),
        );
    }

    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
