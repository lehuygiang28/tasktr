'use client';

import { AuthProvider } from '@refinedev/core';
import Cookies from 'js-cookie';
import { AuthActionResponse } from '@refinedev/core/dist/contexts/auth/types';
import {
    AuthLoginPasswordlessDto,
    AuthLoginPasswordlessQueryDto,
    LoginResponseDto,
} from '~be/app/auth/dtos';
import { loginPwdless, refreshTokens, requestLoginPwdless } from '~/services/auth.service';
import { signIn } from 'next-auth/react';

export const authProvider: AuthProvider & {
    requestLogin: (data: AuthLoginPasswordlessDto) => Promise<AuthActionResponse>;
    refresh: () => Promise<AuthActionResponse & { tokenData?: LoginResponseDto }>;
    getAuthData: () => LoginResponseDto | null;
} = {
    requestLogin: async ({ destination }: AuthLoginPasswordlessDto) => {
        try {
            await requestLoginPwdless({ destination });
            return {
                success: true,
                redirectTo: '/login/check-email',
            };
        } catch (error) {
            // toast({
            //     variant: 'destructive',
            //     title: 'Error',
            //     description: 'Invalid email or password',
            // });
            return {
                success: false,
                error: {
                    name: 'LoginError',
                    message: 'Invalid email, please try again',
                },
            };
        }
    },
    login: async ({
        token,
        provider = null,
        to = '/',
    }: AuthLoginPasswordlessQueryDto & {
        provider?: null | 'google' | 'github';
        to?: null | string;
    }) => {
        if (provider === 'google') {
            signIn('google', {
                callbackUrl: to ? to.toString() : '/',
                redirect: true,
            });

            return {
                success: true,
            };
        }

        try {
            await loginPwdless({ token });
            return {
                success: true,
                redirectTo: '/login/check-email',
            };
        } catch (error) {
            // toast({
            //     variant: 'destructive',
            //     title: 'Error',
            //     description: 'Invalid email or password',
            // });
            return {
                success: false,
                error: {
                    name: 'LoginError',
                    message: 'Invalid email, please try again',
                },
            };
        }
    },
    logout: async () => {
        Cookies.remove('auth', { path: '/' });
        return {
            success: true,
            redirectTo: '/login',
        };
    },
    refresh: async () => {
        const auth = Cookies.get('auth');
        if (!auth) {
            return {
                success: false,
                error: {
                    name: 'RefreshError',
                    message: 'No auth token found',
                },
            };
        }

        try {
            const response = await refreshTokens(JSON.parse(auth)?.refreshToken || '');

            if (!response.data) {
                // toast({
                //     variant: 'destructive',
                //     title: 'Error',
                //     description: 'Refresh failed',
                // });
                throw new Error('Refresh failed');
            }

            Cookies.set('auth', JSON.stringify({ ...JSON.parse(auth), ...response.data }), {
                expires: 30, // 30 days
                path: '/',
            });

            return {
                success: true,
                tokenData: response.data,
            };
        } catch (error) {
            // toast({
            //     variant: 'destructive',
            //     title: 'Error',
            //     description: 'Refresh failed',
            // });
            return {
                success: false,
                error: {
                    name: 'LoginError',
                    message: 'Refresh failed',
                },
            };
        }
    },
    getAuthData: (): LoginResponseDto | null => {
        const auth = Cookies.get('auth');
        if (auth) {
            const parsedUser: LoginResponseDto = JSON.parse(auth);
            return parsedUser;
        }
        return null;
    },
    check: async () => {
        const auth = Cookies.get('auth');
        if (auth) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            logout: true,
            redirectTo: '/login',
        };
    },
    getPermissions: async () => {
        const auth = Cookies.get('auth');
        if (auth) {
            const parsedUser = JSON.parse(auth);
            return parsedUser.roles;
        }
        return null;
    },
    getIdentity: async () => {
        const auth = Cookies.get('auth');
        if (auth) {
            const parsedUser = JSON.parse(auth);
            return parsedUser;
        }
        return null;
    },
    onError: async (error) => {
        if (error.response?.status === 401) {
            return {
                logout: true,
            };
        }

        return { error };
    },
};
