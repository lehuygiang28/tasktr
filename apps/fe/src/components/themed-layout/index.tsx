'use client';

import { PropsWithChildren, useContext } from 'react';
import { Header } from '../../components/header';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { Layout, Typography } from 'antd';

import { ColorModeContext } from '~/contexts/color-mode';
import Link from 'next/link';

const { Text, Title } = Typography;

function CustomSider() {
    return (
        <ThemedSiderV2
            Title={() => (
                <>
                    <Link href={'/'} style={{ all: 'unset', cursor: 'pointer' }}>
                        <Title level={2}>TaskTr</Title>
                    </Link>
                </>
            )}
            render={({ items, logout, collapsed }) => {
                return (
                    <>
                        {items}
                        {logout}
                        {collapsed}
                    </>
                );
            }}
        />
    );
}

function CustomFooter() {
    const { mode } = useContext(ColorModeContext);

    return (
        <Layout.Footer
            style={{
                textAlign: 'center',
                color: mode === 'dark' ? '#fff' : '#000',
            }}
        >
            <Text type="secondary">
                TaskTr ©{new Date().getFullYear()} Made with ❤️ by{' '}
                <Link target="_blank" href="https://github.com/lehuygiang28">
                    lehuygiang28
                </Link>
            </Text>
        </Layout.Footer>
    );
}

export function ThemedLayout({ children }: PropsWithChildren) {
    return (
        <ThemedLayoutV2
            Header={() => <Header sticky />}
            Sider={CustomSider}
            dashboard
            Footer={CustomFooter}
        >
            {children}
        </ThemedLayoutV2>
    );
}
