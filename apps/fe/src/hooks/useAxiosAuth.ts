import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAxios } from './useAxios';
import { useRefreshToken } from './useRefreshToken';

export type UseAxiosAuthPayload =
    | {
          baseURL?: string;
      }
    | undefined;

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
    }, [axiosInstance, session, refreshToken, status, payload]);

    return axiosInstance;
}
