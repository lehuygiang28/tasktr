'use client';

import { useLogin, useNavigation } from '@refinedev/core';
import { Layout, Space, Form, Input, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import type { LoginActionPayload } from '~/providers/auth-provider/types';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginPwdless } from '~/validators';
import LoadingBtn from '~/components/button/loading-btn';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const { Title, Text } = Typography;
const SEEM_SAFE_TOKEN_LENGTH = 30;

export default function Login() {
    const params = useSearchParams();
    const { mutate: login } = useLogin();
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginPwdless>({
        resolver: classValidatorResolver(LoginPwdless),
        defaultValues: { destination: '' },
    });

    const onSubmit: SubmitHandler<LoginPwdless> = (values) => {
        const data: LoginActionPayload = {
            type: 'request-login',
            destination: values.destination,
        };
        return login(data);
    };

    useEffect(() => {
        const token = params.get('token');
        if (token && token.length > SEEM_SAFE_TOKEN_LENGTH) {
            console.log('Token is valid');
            login({ type: 'login', token });
        } else {
            console.log('Token is invalid');
        }
    }, [params, login]);

    return (
        <Layout
            style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Space direction="vertical" align="center">
                <Title level={3} style={{ marginBottom: '4px' }}>
                    Sign in to your account
                </Title>
                <Text>Sign in to your Tasktr</Text>

                <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    <Controller<LoginPwdless>
                        name={'destination'}
                        control={control}
                        render={({ field }) => (
                            <Form.Item<LoginPwdless>
                                name={'destination'}
                                validateStatus={errors?.destination ? 'error' : 'validating'}
                                help={<>{errors?.destination?.message}</>}
                            >
                                <Input
                                    {...field}
                                    prefix={<MailOutlined className="site-form-item-icon" />}
                                    placeholder="Email"
                                />
                            </Form.Item>
                        )}
                    />

                    <LoadingBtn
                        content="Sign in"
                        type="primary"
                        style={{ width: '240px', marginBottom: '32px' }}
                        size="middle"
                        htmlType="submit"
                        isValid={isValid}
                    />
                </form>
            </Space>
        </Layout>
    );
}
