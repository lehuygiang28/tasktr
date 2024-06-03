'use client';

import '@refinedev/antd/dist/reset.css';

import React from 'react';
import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { SessionProvider } from 'next-auth/react';
import { useNotificationProvider } from '@refinedev/antd';

import routerProvider from '@refinedev/nextjs-router';

import { DevtoolsProvider } from '~/providers/devtools';
import { dataProvider } from '~/providers/data-provider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ColorModeContextProvider } from '~/contexts/color-mode';
import { authProvider } from '~/providers/auth-provider';
import { useAxiosAuth } from '~/hooks/useAxiosAuth';
import dataProviderSimpleRest from '@refinedev/simple-rest';

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
    const defaultMode = props?.defaultMode;
    const axiosAuth = useAxiosAuth();
    const tasktrDataProvider = dataProviderSimpleRest(
        process.env.NEXT_PUBLIC_API_URL ?? '',
        axiosAuth,
    );

    return (
        <>
            <DevtoolsProvider>
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
                                    projectId: 'w7Oy9j-G4P3be-shhjL6',
                                }}
                            >
                                {props.children}
                                <RefineKbar />
                            </Refine>
                        </ColorModeContextProvider>
                    </AntdRegistry>
                </RefineKbarProvider>
            </DevtoolsProvider>
        </>
    );
};
