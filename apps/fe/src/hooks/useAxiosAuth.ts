import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';

import { useAxios } from './useAxios';
import { useRefreshToken } from './useRefreshToken';

export type UseAxiosAuthPayload =
    | {
          baseURL?: string;
      }
    | undefined;

const requestsQueue: {
    prevRequest: AxiosRequestConfig;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];
let isRefreshing = false;

export function useAxiosAuth(payload?: UseAxiosAuthPayload) {
    const { instance: axiosInstance } = useAxios();
    const { data: session, status } = useSession();
    const refreshToken = useRefreshToken();

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (payload?.baseURL) {
            axiosInstance.defaults.baseURL = payload.baseURL;
        }

        if (session?.user?.accessToken) {
            axiosInstance.defaults.headers['Authorization'] = `Bearer ${session.user.accessToken}`;
        }

        const requestIntercept = axiosInstance.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${session?.user?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        const responseIntercept = axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true; // prevent infinite loop

                    // Create a Promise to pause the request
                    const retryOriginalRequest = new Promise((resolve, reject) => {
                        // Queue the request with its resolve/reject handlers
                        requestsQueue.push({ resolve, reject, prevRequest });
                    });

                    if (!isRefreshing) {
                        isRefreshing = true;
                        refreshToken()
                            .then(() => {
                                // Retry all queued requests
                                for (const { resolve, prevRequest } of requestsQueue) {
                                    prevRequest.headers['Authorization'] =
                                        `Bearer ${session?.user?.accessToken}`;
                                    resolve(axiosInstance(prevRequest));
                                }
                            })
                            .catch((refreshError) => {
                                // Handle refresh token error
                                for (const { reject } of requestsQueue) {
                                    reject(error);
                                }

                                console.error('Failed to refresh token:', refreshError);
                            })
                            .finally(() => {
                                requestsQueue.length = 0; // Clear the queue
                                isRefreshing = false;
                            });
                    }

                    return retryOriginalRequest; // Return the Promise to pause the original request
                }
                return Promise.reject(error);
            },
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
    }, [axiosInstance, session, refreshToken, status, payload]);

    return axiosInstance;
}
