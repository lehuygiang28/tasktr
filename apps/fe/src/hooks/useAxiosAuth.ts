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

const requestsQueue: AxiosRequestConfig[] = [];
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
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    // Queue the request
                    requestsQueue.push(prevRequest);
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            await refreshToken();

                            for (const queuedRequest of requestsQueue) {
                                queuedRequest.headers['Authorization'] =
                                    `Bearer ${session?.user?.accessToken}`;
                                axiosInstance(queuedRequest);
                            }

                            requestsQueue.length = 0; // Clear the queue
                        } catch (refreshError) {
                            // Handle refresh token error
                            console.error('Failed to refresh token:', refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    }
                    return axiosInstance(prevRequest);
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
