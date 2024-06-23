'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import {
    Layout,
    Menu,
    Button,
    Typography,
    Drawer,
    Space,
    Skeleton,
    Row,
    Col,
    Avatar,
    Dropdown,
} from 'antd';
import { useIsAuthenticated, useGetIdentity, useLogout } from '@refinedev/core';
import {
    LogoutOutlined,
    MenuOutlined,
    LoginOutlined,
    DownOutlined,
    UpOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import { RiDashboardHorizontalLine } from 'react-icons/ri';
import { GrSchedulePlay } from 'react-icons/gr';

import { ColorModeContext } from '~/contexts/color-mode';
import { type UserDto } from '~be/app/users/dtos';

const { Header } = Layout;
const { Link, Text } = Typography;

const menuItems: { label: string; key: string; icon: React.ReactNode }[] = [];

export default function HomePageHeader() {
    const { mode } = useContext(ColorModeContext);

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { data: isAuthData, isLoading: isLoadingAuth } = useIsAuthenticated();
    const { data: identity, isLoading: isLoadingIdentity } = useGetIdentity<UserDto>();
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

    const loggedItems = [
        {
            key: 'dashboard',
            icon: <RiDashboardHorizontalLine />,
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            key: 'tasks',
            icon: <GrSchedulePlay />,
            title: 'Tasks',
            href: '/tasks',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            title: 'Logout',
            onClick: handleLogout,
        },
    ];
    const unloggedItems = [
        {
            key: 'login',
            icon: <LoginOutlined />,
            title: 'Login',
            href: '/login',
            onClick: undefined,
        },
    ];

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
                                            items: loggedItems.map((item) => {
                                                return {
                                                    key: item.key,
                                                    label: (
                                                        <NextLink
                                                            key={item.key}
                                                            href={item?.href || '#'}
                                                            onClick={item?.onClick || undefined}
                                                        >
                                                            <Space>
                                                                {item.icon}
                                                                {item.title}
                                                            </Space>
                                                        </NextLink>
                                                    ),
                                                };
                                            }),
                                        }}
                                        trigger={['click']}
                                        onOpenChange={handleVisibleChange}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {!isLoadingIdentity && (
                                                <Space
                                                    size="middle"
                                                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                >
                                                    <Text strong>{identity?.email}</Text>
                                                    <Avatar
                                                        src={identity?.avatar?.url}
                                                        alt={`avatar of ${identity?.email}`}
                                                    />
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
                                            {unloggedItems.map((item) => (
                                                <NextLink
                                                    key={item.key}
                                                    href={item?.href || '#'}
                                                    onClick={item?.onClick || undefined}
                                                >
                                                    <Button type="text">
                                                        {item.icon}
                                                        {item.title}
                                                    </Button>
                                                </NextLink>
                                            ))}
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
                    {isLoadingAuth ? (
                        <Skeleton.Button active size="small" shape="round" />
                    ) : isAuthData?.authenticated ? (
                        <>
                            {loggedItems.map((item) => (
                                <Menu.Item key={item.key} icon={item.icon}>
                                    <Link onClick={item?.onClick} href={item?.href || '#'}>
                                        {item.title}
                                    </Link>
                                </Menu.Item>
                            ))}
                        </>
                    ) : (
                        <>
                            {unloggedItems.map((item) => (
                                <Menu.Item key={item.key} icon={item.icon}>
                                    <Link onClick={item?.onClick} href={item?.href || '#'}>
                                        {item.title}
                                    </Link>
                                </Menu.Item>
                            ))}
                            <Menu.Item key="register">
                                <NextLink href="/register">
                                    <Button type="primary" ghost>
                                        Register <ArrowRightOutlined />
                                    </Button>
                                </NextLink>
                            </Menu.Item>
                        </>
                    )}
                </Menu>
            </Drawer>
        </Header>
    );
}
