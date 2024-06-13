'use client';

import Link from 'next/link';
import { Layout, Typography, Space } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export default function HomePageFooter() {
    return (
        <Footer style={{ textAlign: 'center', marginTop: '80px' }}>
            <Space direction="vertical" size={'middle'}>
                <Link href="/privacy">
                    <Text type="secondary">Privacy</Text>
                </Link>
                <Text type="secondary">
                    TaskTr ©{new Date().getFullYear()} Made with ❤️ by{' '}
                    <Link target="_blank" href="https://github.com/lehuygiang28">
                        lehuygiang28
                    </Link>
                </Text>
            </Space>
        </Footer>
    );
}
