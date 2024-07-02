'use client';

import { Fragment, PropsWithChildren, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Layout, Typography } from 'antd';
import { useGetIdentity } from '@refinedev/core';
import { ThemedLayoutV2, ThemedSiderV2 } from '@refinedev/antd';

import { Header } from '~/components/header';
import { ColorModeContext } from '~/contexts/color-mode';
import { UserRoleEnum } from '~be/app/users/users.enum';
import { type UserDto } from '~be/app/users/dtos';

const { Text } = Typography;

function CustomSider({ mode, user }: { mode: string; user: UserDto }) {
    return (
        <ThemedSiderV2
            Title={() => (
                <>
                    <Link href={'/'} style={{ all: 'unset', cursor: 'pointer' }}>
                        <Image
                            src={
                                mode === 'dark' ? '/images/logo-pp.webp' : '/images/logo-black.webp'
                            }
                            alt="logo tasktr"
                            width={80}
                            height={24}
                        />
                    </Link>
                </>
            )}
            render={({ items, logout, collapsed }) => {
                return (
                    <>
                        {items.map((item, index) => {
                            if (item.key.includes('admin') && user?.role !== UserRoleEnum.Admin) {
                                return <Fragment key={`${item.key}_${index}`}></Fragment>;
                            }

                            return <Fragment key={`${item.key}_${index}`}>{item}</Fragment>;
                        })}
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
    const { data: user } = useGetIdentity<UserDto>();

    return (
        <ThemedLayoutV2
            Header={() => <Header user={user} sticky />}
            Sider={() => <CustomSider mode={mode} user={user} />}
            Footer={() => <CustomFooter mode={mode} />}
        >
            {children}
        </ThemedLayoutV2>
    );
}
