'use client';

import { PropsWithChildren, useContext } from 'react';
import Image from 'next/image';
import { Header } from '../../components/header';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';
import { Layout, Typography } from 'antd';

import { ColorModeContext } from '~/contexts/color-mode';
import Link from 'next/link';

const { Text } = Typography;

function CustomSider({ mode }: { mode: string }) {
    return (
        <ThemedSiderV2
            Title={() => (
                <>
                    <Link href={'/'} style={{ all: 'unset', cursor: 'pointer' }}>
                        {mode === 'dark' && (
                            <Image
                                src={'/images/logo-pp.webp'}
                                alt="logo tasktr"
                                width={80}
                                height={24}
                            />
                        )}
                        {mode === 'light' && (
                            <Image
                                src={'/images/logo-black.webp'}
                                alt="logo tasktr"
                                width={80}
                                height={24}
                            />
                        )}{' '}
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

function CustomFooter({ mode }: { mode: string }) {
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
    const { mode } = useContext(ColorModeContext);

    return (
        <ThemedLayoutV2
            Header={() => <Header sticky />}
            Sider={() => (
                <>
                    <CustomSider mode={mode} />
                </>
            )}
            dashboard
            Footer={() => (
                <>
                    <CustomFooter mode={mode} />
                </>
            )}
        >
            {children}
        </ThemedLayoutV2>
    );
}
