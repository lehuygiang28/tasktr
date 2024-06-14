import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRefreshToken } from './useRefreshToken';
import { axiosInstance } from '~/libs/axios';

export type UseAxiosAuthPayload = {
    baseURL?: string;
};

export function useAxiosAuth({ baseURL }: UseAxiosAuthPayload) {
    const { data: session, status } = useSession();
    const refreshToken = useRefreshToken();

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (!axiosInstance.defaults?.baseURL) {
            axiosInstance.defaults.baseURL = baseURL ?? process.env.NEXT_PUBLIC_API_URL;
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
                    await refreshToken();
                    prevRequest.headers['Authorization'] = `Bearer ${session?.user.accessToken}`;
                    return axiosInstance(prevRequest);
                }
                return Promise.reject(error);
            },
        );

        return () => {
            axiosInstance.interceptors.request.eject(requestIntercept);
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
    }, [session, refreshToken, status, baseURL]);

    return axiosInstance;
}
