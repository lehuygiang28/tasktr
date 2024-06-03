import { AxiosInstance } from 'axios';

export const DURATION_KEY = 'X-Duration';
export const RESPONSE_SIZE_KEY = 'X-Response-Size';

const START_TIME_DURATION_KEY = 'X-Start-Time-Duration';

export function addMonitorInterceptor(axiosClient: AxiosInstance) {
    axiosClient.interceptors.request.use((config) => {
        config.headers[START_TIME_DURATION_KEY] = Date.now();
        return config;
    });

    axiosClient.interceptors.response.use((response) => {
        // Calculate the duration of the request
        const startTime = response.config.headers[START_TIME_DURATION_KEY];
        const duration = Date.now() - (Number(startTime) || 0);
        console.log(`Response: ${response.status}, Duration: ${duration} ms`);

        // Add the duration to the response headers
        response.headers[DURATION_KEY] = duration;

        // Add other monitoring data to the response headers
        response.headers[RESPONSE_SIZE_KEY] = JSON.stringify(response.data).length;

        return response;
    });
}
