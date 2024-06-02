'use client';

import { AuthProvider } from '@refinedev/core';
import Cookies from 'js-cookie';
import { AuthActionResponse } from '@refinedev/core/dist/contexts/auth/types';
import { LoginResponseDto } from '~be/app/auth/dtos';
import { refreshTokens, requestLoginPwdless } from '~/services/auth.service';
import { signIn } from 'next-auth/react';
import type { LoginActionPayload, LoginAction, RequestLoginAction } from './types/login.type';

export const authProvider: AuthProvider & {
    refresh: () => Promise<AuthActionResponse & { tokenData?: LoginResponseDto }>;
    getAuthData: () => LoginResponseDto | null;
} = {
    login: async ({ type, ...data }: LoginActionPayload) => {
        if (type === 'login') {
            const loginData = data as LoginAction;
            const { token, provider = null, to = '/' } = loginData;

            if (provider === 'google') {
                signIn('google', {
                    callbackUrl: to ? to.toString() : '/',
                    redirect: true,
                });

                return {
                    success: true,
                    redirectTo: to ? to.toString() : '/',
                };
            }

            try {
                await signIn('credentials', {
                    token,
                });
                return {
                    success: true,
                    redirectTo: to ? to.toString() : '/',
                };
            } catch (error) {
                return {
                    success: false,
                    error: {
                        name: 'LoginError',
                        message: 'Invalid email, please try again',
                    },
                };
            }
        } else {
            const requestData = data as RequestLoginAction;
            console.log('requestData', requestData);
            try {
                await requestLoginPwdless({
                    destination: requestData.destination,
                });

                return {
                    success: true,
                    redirectTo: '/login',
                    successNotification: {
                        description: 'Check your email',
                        message: `We've sent you an email with a link to log in. Click the link to continue.`,
                    },
                };
            } catch (error) {
                return {
                    success: false,
                    error: {
                        name: 'LoginError',
                        message: 'Invalid email, please try again',
                    },
                };
            }
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
