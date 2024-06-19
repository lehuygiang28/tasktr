import { HttpModuleOptions } from '@nestjs/axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as http from 'node:http';
import * as https from 'node:https';
import type { ClientRequestWithTimings, Timings } from '@szmarczak/http-timer';
import { importESM } from '~be/common/utils/import-helper';

// Custom adapter to integrate http-timer
export const httpTimerAdapter = async (
    config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> => {
    const timer = await importESM<{ default: (request: ClientRequestWithTimings) => Timings }>(
        '@szmarczak/http-timer',
    );

    return new Promise((resolve, reject) => {
        const url = new URL(config.url || config.baseURL || '');
        const request = url?.protocol === 'https:' ? https.request : http.request;
        const options = {
            hostname: url.hostname,
            port: url?.port ? parseInt(url.port) : url?.protocol === 'https:' ? 443 : 80,
            path: url.pathname,
            method: (config?.method || 'get').toUpperCase(),
            headers: config.headers,
            agent: url.protocol === 'https:' ? config.httpsAgent : config.httpAgent,
        };

        const clientRequest = request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    data,
                    status: res?.statusCode || 500,
                    statusText: res?.statusMessage || 'Request failed',
                    headers: res.headers,
                    config,
                    request: clientRequest,
                });
            });
        });

        timer.default(clientRequest);

        clientRequest.on('error', (err) => {
            reject(err);
        });

        if (config.data) {
            clientRequest.write(config.data);
        }
        clientRequest.end();
    });
};

export const axiosConfig: HttpModuleOptions = {
    headers: {
        'Content-Type': 'application/text',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36',
    },
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    adapter: httpTimerAdapter,
};
