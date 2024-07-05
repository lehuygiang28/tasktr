import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Timings } from '@szmarczak/http-timer';
import { AxiosRequestConfig } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { normalizeHeaders } from '~be/common/utils';
import { defaultHeaders } from '~be/common/axios';
import { TryRequestDto, TryRequestResponseDto } from '../dtos';

@Injectable()
export class TaskExecutionService {
    constructor(
        private readonly httpService: HttpService,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(TaskExecutionService.name);
    }

    public async tryRequestTask({ taskData }: { taskData: TryRequestDto }) {
        const { endpoint, method, body = undefined, headers } = taskData;
        const normalizedHeaders = headers ? normalizeHeaders(JSON.parse(headers)) : {};
        const headersValidated = Object.assign(normalizeHeaders(defaultHeaders), normalizedHeaders);

        const config: AxiosRequestConfig = {
            url: endpoint,
            method,
            headers: headersValidated,
            data: body,
        };

        let returnRes: TryRequestResponseDto;

        try {
            const response = await this.httpService.axiosRef.request(config);

            const stringBody = String(response.data);
            const timings: Timings = response.request['timings'] || null;

            returnRes = new TryRequestResponseDto({
                endpoint: endpoint,
                method: method,
                statusCode: response?.status ?? 0,
                responseSizeBytes: stringBody?.length ?? 0,
                timings: timings?.phases || {},
                request: {
                    headers: response.request?.headers || response.config?.headers,
                    body: body,
                },

                response: {
                    headers: response?.headers,
                    body:
                        stringBody?.length > Number(process.env['MAX_BODY_LOG_SIZE'] || 1024 * 50) // Default 50KB
                            ? `Body too large (${stringBody?.length} bytes), will not be logged.`
                            : stringBody,
                },
            });
        } catch (error) {
            this.logger.error(error);
            returnRes = new TryRequestResponseDto({
                endpoint: endpoint,
                method: method,
                statusCode: error?.response?.status ?? 0,
                responseSizeBytes: error?.response?.data?.length ?? 0,
                timings: error?.response?.request?.['timings'] || null,
                request: {
                    headers: error?.response?.request?.headers || error?.response?.config?.headers,
                    body: body,
                },
                response: {
                    headers: error?.response?.headers,
                    body: error?.response?.data,
                },
                errorMessage: error?.message ?? error?.response?.data,
            });
        }

        return returnRes;
    }
}
