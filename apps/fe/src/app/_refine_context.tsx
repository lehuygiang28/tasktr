'use client';

import '@refinedev/antd/dist/reset.css';

import React from 'react';
import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { SessionProvider } from 'next-auth/react';
import { useNotificationProvider } from '@refinedev/antd';
import dataProviderSimpleRest from '@refinedev/simple-rest';
import routerProvider from '@refinedev/nextjs-router';

import { AntdRegistry } from '@ant-design/nextjs-registry';

import { ColorModeContextProvider } from '~/contexts/color-mode';
import { DevtoolsProvider } from '~/providers/devtools';
import { authProvider } from '~/providers/auth-provider';
import { useAxiosAuth } from '~/hooks/useAxiosAuth';
import worldTimeAPIProvider from '~/providers/data-provider/timezone';

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
                                    default: tasktrDataProvider,
                                    [worldTimeAPIProvider.name]: worldTimeAPIProvider,
                                }}
                                notificationProvider={useNotificationProvider}
                                authProvider={authProvider}
                                resources={[
                                    {
                                        name: 'tasks',
                                        list: '/tasks',
                                        create: '/tasks/create',
                                        edit: '/tasks/edit/:id',
                                        show: '/tasks/show/:id',
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
