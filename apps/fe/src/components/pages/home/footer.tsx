'use client';

import { Layout, Typography, Space } from 'antd';

const { Footer } = Layout;
const { Text, Link } = Typography;

export default function HomePageFooter() {
    return (
        <Footer style={{ textAlign: 'center', marginTop: '80px' }}>
            <Space direction="vertical" size={'large'}>
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
