import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfig } from './all-config.type';

@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService<AllConfig>) {}

    get isServerless(): boolean {
        return this.configService.getOrThrow('app.deployEnv', { infer: true }) === 'serverless';
    }

    get isWorker(): boolean {
        return this.configService.getOrThrow('app.workerMode', { infer: true });
    }
}
