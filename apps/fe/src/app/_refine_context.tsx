'use client';

import '@refinedev/antd/dist/reset.css';

import React from 'react';
import { Refine, type AuthProvider } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { SessionProvider, useSession, signOut, signIn } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useNotificationProvider } from '@refinedev/antd';

import routerProvider from '@refinedev/nextjs-router';

import { dataProvider } from '~/providers/data-provider';
import { tasktrDataProvider } from '~/providers/data-provider/tasktr';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ColorModeContextProvider } from '~/contexts/color-mode';
import { authProvider } from '~/providers/auth-provider';

type RefineContextProps = {
    defaultMode?: string;
};

export const RefineContext = (props: React.PropsWithChildren<RefineContextProps>) => {
    return (
        <SessionProvider>
            <App {...props} />
        </SessionProvider>
    );
};

type AppProps = {
    defaultMode?: string;
};

const App = (props: React.PropsWithChildren<AppProps>) => {
    const { data, status } = useSession();
    const to = usePathname();

    if (status === 'loading') {
        return <span>loading...</span>;
    }

    const authProviderGG: AuthProvider = {
        login: async () => {
            signIn('google', {
                callbackUrl: to ? to.toString() : '/',
                redirect: true,
            });

            return {
                success: true,
            };
        },
        logout: async () => {
            signOut({
                redirect: true,
                callbackUrl: '/login',
            });

            return {
                success: true,
            };
        },
        onError: async (error) => {
            if (error.response?.status === 401) {
                return {
                    logout: true,
                };
            }

            return {
                error,
            };
        },
        check: async () => {
            if (status === 'unauthenticated') {
                return {
                    authenticated: false,
                    redirectTo: '/login',
                };
            }

            return {
                authenticated: true,
            };
        },
        getPermissions: async () => {
            return null;
        },
        getIdentity: async () => {
            if (data?.user) {
                const { user } = data;
                return {
                    name: user.name,
                    avatar: user.image,
                };
            }

            return null;
        },
    };

    const defaultMode = props?.defaultMode;

    return (<>
        <RefineKbarProvider>
            <AntdRegistry>
                <ColorModeContextProvider defaultMode={defaultMode}>
                    <Refine
                        routerProvider={routerProvider}
                        dataProvider={{
                            default: dataProvider,
                            tasktr: tasktrDataProvider,
                        }}
                        notificationProvider={useNotificationProvider}
                        authProvider={authProvider}
                        resources={[
                            {
                                name: 'blog_posts',
                                list: '/blog-posts',
                                create: '/blog-posts/create',
                                edit: '/blog-posts/edit/:id',
                                show: '/blog-posts/show/:id',
                                meta: {
                                    canDelete: true,
                                },
                            },
                            {
                                name: 'categories',
                                list: '/categories',
                                create: '/categories/create',
                                edit: '/categories/edit/:id',
                                show: '/categories/show/:id',
                                meta: {
                                    canDelete: true,
                                },
                            },
                        ]}
                        options={{
                            syncWithLocation: true,
                            warnWhenUnsavedChanges: true,
                            useNewQueryKeys: true,
                            projectId: "w7Oy9j-G4P3be-shhjL6"
                        }}
                    >
                        {props.children}
                        <RefineKbar />
                    </Refine>
                </ColorModeContextProvider>
            </AntdRegistry>
        </RefineKbarProvider>
    </>);
};
