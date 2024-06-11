import { Module } from '@nestjs/common';
import { join } from 'path';
import {
    I18nModule as I18nModuleCore,
    AcceptLanguageResolver,
    HeaderResolver,
    I18nContext,
} from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        I18nModuleCore.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                fallbackLanguage: configService.get('FALLBACK_LANGUAGE') || 'en',
                loaderOptions: {
                    path: join(
                        __dirname,
                        configService.get('DEPLOY_ENV')?.toLowerCase() === 'serverless'
                            ? './lang/'
                            : './assets/i18n/lang/',
                    ),
                    watch: true,
                },
                typesOutputPath:
                    configService.get('DEPLOY_ENV')?.toLowerCase() === 'serverless'
                        ? undefined
                        : join(process.cwd(), `./apps/be/common/src/i18n/i18n.generated.ts`),
            }),
            resolvers: [
                new HeaderResolver(['x-lang', 'x-language', 'language']),
                AcceptLanguageResolver, // must be the last one
            ],
            inject: [ConfigService],
        }),
    ],
    providers: [I18nContext],
    exports: [I18nContext],
})
export class I18nModule {}
