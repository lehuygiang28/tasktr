'use client';

import { useLogin } from '@refinedev/core';
import { ThemedTitleV2 } from '@refinedev/antd';
import { Button, Layout, Space, Form, Input, FormProps } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { AuthLoginPasswordlessDto } from '~be/app/auth/dtos';

export default function Login() {
    const { mutate: login } = useLogin();

    const onFinish: FormProps<AuthLoginPasswordlessDto>['onFinish'] = (values) => {
        console.log('Success:', values);
    };

    const onFinishFailed: FormProps<AuthLoginPasswordlessDto>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    return (
        <Layout
            style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Space direction="vertical" align="center">
                <ThemedTitleV2
                    collapsed={false}
                    wrapperStyles={{
                        fontSize: '22px',
                    }}
                />

                <Form autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                    <Form.Item<AuthLoginPasswordlessDto>
                        name="destination"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input
                            prefix={<MailOutlined className="site-form-item-icon" />}
                            placeholder="Email"
                        />
                    </Form.Item>

                    <Button
                        style={{ width: '240px', marginBottom: '32px' }}
                        type="primary"
                        size="middle"
                        htmlType="submit"
                    >
                        Sign in
                    </Button>
                </Form>
            </Space>
        </Layout>
    );
}
