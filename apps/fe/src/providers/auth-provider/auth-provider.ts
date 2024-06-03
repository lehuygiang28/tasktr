'use client';

import { AuthProvider } from '@refinedev/core';
import { LoginResponseDto } from '~be/app/auth/dtos';
import { requestLoginPwdless } from '~/services/auth.service';
import { signIn, getSession, signOut } from 'next-auth/react';
import type { LoginActionPayload, LoginAction, RequestLoginAction } from './types/login.type';

export const authProvider: AuthProvider = {
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
        await signOut();
        return {
            success: true,
            redirectTo: '/',
        };
    },
    check: async () => {
        const auth = await getSession();
        if (auth) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
        };
    },
    getIdentity: async () => {
        const auth = await getSession();
        if (auth?.user) {
            const { refreshToken, accessToken, ...user } = auth.user as LoginResponseDto;
            return user;
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
