'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Grid, Drawer, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useIsAuthenticated, useGetIdentity, useLogout } from '@refinedev/core';
import { LoginResponseDto } from '~be/app/auth/dtos';

const { Header } = Layout;
const { Link } = Typography;

const menuItems: MenuProps['items'] = [
    { label: 'Pricing', key: 'pricing' },
    { label: 'Features', key: 'features' },
    { label: 'Docs', key: 'docs' },
];

export default function HomePageHeader() {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const screens = Grid.useBreakpoint();

    const { data: isAuthData } = useIsAuthenticated();
    const { data: identity } = useGetIdentity<LoginResponseDto>();
    const { mutate: logout } = useLogout();

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onClose = () => {
        setDrawerVisible(false);
    };

    return (
        <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignContent: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                }}
            >
                <div className="demo-logo">TaskTr</div>
                {screens.md ? (
                    <>
                        <Menu
                            mode="horizontal"
                            items={menuItems}
                            style={{ backgroundColor: 'transparent' }}
                        />
                        {isAuthData?.authenticated ? (
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'logout',
                                            label: (
                                                <Link key="logout" onClick={() => logout()}>
                                                    Sign out
                                                </Link>
                                            ),
                                        },
                                    ],
                                }}
                                trigger={['click']}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Avatar src={identity?.avatar?.url} />
                                    <span style={{ marginLeft: '10px' }}>{identity?.email}</span>
                                </div>
                            </Dropdown>
                        ) : (
                            <Button href="/login" style={{ marginLeft: screens.md ? '0' : 'auto' }}>
                                Sign in
                            </Button>
                        )}
                    </>
                ) : (
                    <Button type="link" onClick={showDrawer}>
                        <MenuOutlined />
                    </Button>
                )}
            </div>
            <Drawer
                title="Menu"
                placement="right"
                closable={true}
                onClose={onClose}
                open={drawerVisible}
                width={250}
            >
                <Menu
                    mode="vertical"
                    items={[
                        ...(menuItems || []),
                        {
                            key: 'login',
                            label: isAuthData?.authenticated ? (
                                <Link onClick={() => logout()} underline>
                                    Log out
                                </Link>
                            ) : (
                                <Link href="/login" underline>
                                    Sign in
                                </Link>
                            ),
                        },
                    ]}
                    style={{ backgroundColor: 'transparent' }}
                />
            </Drawer>
        </Header>
    );
}
