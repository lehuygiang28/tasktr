'use client';

import { Layout, Typography, Space, Row } from 'antd';
import { GithubOutlined, LinkedinOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Text, Link } = Typography;

export default function HomePageFooter() {
    return (
        <Footer style={{ textAlign: 'center', marginTop: '80px' }}>
            <Space direction="vertical" size={'large'}>
                <Row justify={'center'}>
                    <Space>
                        <Link target="_blank" href="https://github.com/lehuygiang28">
                            <GithubOutlined style={{ fontSize: '24px' }} />
                        </Link>
                        <Link target="_blank" href="https://linkedin.com/in/lehuygiang28">
                            <LinkedinOutlined style={{ fontSize: '24px' }} />
                        </Link>
                    </Space>
                </Row>

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
