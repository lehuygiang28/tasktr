import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLogger } from 'nestjs-pino';
import { Request } from 'express';
import { isTrueSet } from '../utils';

@Module({
    imports: [
        PinoLogger.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                /**
                 * Can config some async/promise options here
                 */
                const isProduction = config.getOrThrow<string>('NODE_ENV') === 'production';
                const disableLogger = isTrueSet(config.get<boolean>('DISABLE_LOGGER', false));

                if (disableLogger) {
                    return {
                        pinoHttp: {
                            enabled: false,
                        },
                    };
                }

                return {
                    pinoHttp: {
                        level: isProduction ? 'info' : 'debug',
                        transport: isProduction ? undefined : { target: 'pino-pretty' },
                        ...(isProduction
                            ? {}
                            : {
                                  serializers: {
                                      req: (req: Request) => ({
                                          id: req.id,
                                          method: req.method,
                                          url: req.url,
                                      }),
                                  },
                              }),
                    },
                };
            },
        }),
    ],
})
export class LoggerModule {}
