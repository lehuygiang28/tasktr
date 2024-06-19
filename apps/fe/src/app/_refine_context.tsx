'use client';

import '@refinedev/antd/dist/reset.css';

import React from 'react';
import { DataProvider, Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';
import { SessionProvider } from 'next-auth/react';
import { useNotificationProvider } from '@refinedev/antd';
import { DeleteOutlined, ScheduleOutlined, DashboardOutlined } from '@ant-design/icons';
import routerProvider from '@refinedev/nextjs-router';

import { AntdRegistry } from '@ant-design/nextjs-registry';

import { ColorModeContextProvider } from '~/contexts/color-mode';
import { DevtoolsProvider } from '~/providers/devtools';
import { authProvider } from '~/providers/auth-provider';
import { useAxiosAuth } from '~/hooks/useAxiosAuth';
import worldTimeAPIProvider from '~/providers/data-provider/timezone';
import { tasktrDataProvider } from '~/providers/data-provider/tasktr';

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
    const axiosAuth = useAxiosAuth({ baseURL: process.env.NEXT_PUBLIC_API_URL });

    return (
        <>
            <DevtoolsProvider>
                <RefineKbarProvider>
                    <AntdRegistry>
                        <ColorModeContextProvider defaultMode={defaultMode}>
                            <Refine
                                routerProvider={routerProvider}
                                dataProvider={{
                                    default: { ...tasktrDataProvider(axiosAuth) } as DataProvider,
                                    [worldTimeAPIProvider.name]: worldTimeAPIProvider,
                                }}
                                notificationProvider={useNotificationProvider}
                                authProvider={authProvider}
                                resources={[
                                    {
                                        name: 'dashboard',
                                        list: '/dashboard',
                                        meta: {
                                            canDelete: false,
                                            icon: <DashboardOutlined />,
                                        },
                                    },
                                    {
                                        name: 'tasks',
                                        list: '/tasks',
                                        create: '/tasks/create',
                                        edit: '/tasks/edit/:id',
                                        show: '/tasks/show/:id',
                                        meta: {
                                            canDelete: true,
                                            icon: <ScheduleOutlined />,
                                        },
                                    },
                                    {
                                        name: 'recycle-bin',
                                        list: '/recycle-bin',
                                        meta: {
                                            canDelete: true,
                                            icon: <DeleteOutlined />,
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
