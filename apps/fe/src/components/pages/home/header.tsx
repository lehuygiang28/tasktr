'use client';

import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import NextLink from 'next/link';
import { Layout, Menu, Button, Typography, Drawer, Space, Skeleton, Row, Col } from 'antd';
import {
    LogoutOutlined,
    MenuOutlined,
    LoginOutlined,
    DownOutlined,
    UpOutlined,
    UnorderedListOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { useIsAuthenticated, useGetIdentity, useLogout } from '@refinedev/core';
import { LoginResponseDto } from '~be/app/auth/dtos';
import { ColorModeContext } from '~/contexts/color-mode';

const Avatar = dynamic(() => import('antd').then((antd) => antd.Avatar), { ssr: false });
const Dropdown = dynamic(() => import('antd').then((antd) => antd.Dropdown), { ssr: false });

const { Header } = Layout;
const { Link } = Typography;

const menuItems: { label: string; key: string; icon: React.ReactNode }[] = [];

export default function HomePageHeader() {
    const { mode } = useContext(ColorModeContext);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data: isAuthData, isLoading: isLoadingAuth } = useIsAuthenticated();
    const { data: identity, isLoading: isLoadingIdentity } = useGetIdentity<LoginResponseDto>();
    const { mutate: logout } = useLogout();

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onClose = () => {
        setDrawerVisible(false);
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    const handleVisibleChange = (flag: boolean) => {
        setDropdownOpen(flag);
    };

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 2rem',
                backgroundColor: mode === 'light' ? 'transparent' : undefined,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                }}
            >
                <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
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
                    )}
                </Link>
                <Row>
                    <Col xs={0} md={24}>
                        <Space align="center">
                            <Menu
                                mode="horizontal"
                                items={menuItems.map((item) => ({
                                    ...item,
                                    label: <Link href={item.key}>{item.label}</Link>,
                                }))}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: '0',
                                    margin: '0 1rem',
                                }}
                                selectedKeys={[]}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {isLoadingAuth && isLoadingIdentity ? (
                                    <Space align="center">
                                        <Skeleton.Avatar
                                            active
                                            size="small"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        />
                                        <Skeleton.Button
                                            active
                                            size="small"
                                            shape="round"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Space>
                                ) : isAuthData?.authenticated ? (
                                    <Dropdown
                                        menu={{
                                            items: [
                                                {
                                                    key: 'tasks',
                                                    label: (
                                                        <Link key="tasks" href="/tasks">
                                                            <Space>
                                                                <UnorderedListOutlined />
                                                                Tasks
                                                            </Space>
                                                        </Link>
                                                    ),
                                                },
                                                {
                                                    key: 'logout',
                                                    label: (
                                                        <Link key="logout" onClick={handleLogout}>
                                                            <Space>
                                                                <LogoutOutlined /> Logout
                                                            </Space>
                                                        </Link>
                                                    ),
                                                },
                                            ],
                                        }}
                                        trigger={['click']}
                                        onVisibleChange={handleVisibleChange}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {!isLoadingIdentity && (
                                                <Space size="middle" style={{ cursor: 'pointer' }}>
                                                    <Avatar src={identity?.avatar?.url} />
                                                    <span>{identity?.email}</span>
                                                    {dropdownOpen ? (
                                                        <UpOutlined style={{ fontSize: '8px' }} />
                                                    ) : (
                                                        <DownOutlined style={{ fontSize: '8px' }} />
                                                    )}
                                                </Space>
                                            )}
                                        </div>
                                    </Dropdown>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Space>
                                            <NextLink href="/login">
                                                <Button type="text" ghost>
                                                    Login
                                                </Button>
                                            </NextLink>
                                            <NextLink href="/register">
                                                <Button type="primary" ghost>
                                                    Register <ArrowRightOutlined />
                                                </Button>
                                            </NextLink>
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </Space>
                    </Col>
                    <Col xs={24} md={0}>
                        <Button type="link" onClick={showDrawer} icon={<MenuOutlined />} />
                    </Col>
                </Row>
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
                    mode="inline"
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'inherit',
                        border: 'none',
                    }}
                >
                    {menuItems.map((item) => (
                        <Menu.Item key={item.key} icon={item.icon}>
                            <Link href={item.key}>{item.label}</Link>
                        </Menu.Item>
                    ))}

                    {isLoadingAuth ? (
                        <Skeleton.Button active size="small" shape="round" />
                    ) : isAuthData?.authenticated ? (
                        <Menu.Item key="logout" icon={<LogoutOutlined />}>
                            <Link onClick={handleLogout} href="#">
                                Logout
                            </Link>
                        </Menu.Item>
                    ) : (
                        <Menu.Item key="login" icon={<LoginOutlined />}>
                            <Link href="/login">Login</Link>
                        </Menu.Item>
                    )}
                </Menu>
            </Drawer>
        </Header>
    );
}
