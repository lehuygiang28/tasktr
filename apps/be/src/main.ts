import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import {
    DocumentBuilder,
    SwaggerCustomOptions,
    SwaggerDocumentOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import * as swaggerStats from 'swagger-stats';

import {
    ProblemDetails,
    ProblemDetailsFilter,
    ResolvePromisesInterceptor,
    validationOptions,
} from '~be/common/utils';
import { AppModule } from './app/app.module';
import { AllConfig } from './app/config/all-config.type';

async function bootstrap() {
    const port = process.env.PORT || 8000;

    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const configService: ConfigService<AllConfig> = app.get(ConfigService);
    const logger = app.get(Logger);

    app.enableCors();
    app.useLogger(app.get(Logger));

    app.use(helmet());
    app.enableShutdownHooks();

    app.useGlobalPipes(new ValidationPipe(validationOptions));
    app.useGlobalFilters(new ProblemDetailsFilter(app.get(Logger)));

    app.useGlobalInterceptors(
        // ResolvePromisesInterceptor is used to resolve promises in responses because class-transformer can't do it
        // https://github.com/typestack/class-transformer/issues/549
        new ResolvePromisesInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.setGlobalPrefix(configService.getOrThrow('app.globalPrefix', { infer: true }));

    const swaggerDocumentConfig = new DocumentBuilder()
        .setTitle('Tasktr RESTful API Documentations')
        .setContact('lehuygiang28', 'https://giaang.id.vn', 'lehuygiang28@gmail.com')
        .setDescription('The documentations of the Tasktr RESTful API')
        .setVersion('0.0.1')
        .setLicense('MIT LICENSE', 'https://github.com/lehuygiang28/tasktr?tab=MIT-1-ov-file')
        .setExternalDoc('Tasktr Github', 'https://github.com/lehuygiang28/tasktr')
        .addServer('http://localhost:8000', 'https://tasktr.vercel.app')
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
        customfavIcon: '/favicon.ico',
    };
    SwaggerModule.setup('docs', app, document, swaggerCustomOptions);

    if (configService.get('app.apiStatsPath', { infer: true })) {
        app.use(
            swaggerStats.getMiddleware({
                uriPath: configService.getOrThrow('app.apiStatsPath', { infer: true }),
                swaggerSpec: document,
                name: 'Tasktr API statistics',
                timelineBucketDuration: 180000,
                authentication: true,
                async onAuthenticate(req, username, password) {
                    if (
                        username === configService.get('app.apiStatsUsername', { infer: true }) &&
                        password === configService.get('app.apiStatsPassword', { infer: true })
                    ) {
                        return true;
                    }

                    return false;
                },
            }),
        );
    }

    await app.listen(port);
    logger.log(
        `🚀 Application is running on: http://localhost:${port}/${configService.get('app.globalPrefix', { infer: true })}`,
    );
}

bootstrap();
