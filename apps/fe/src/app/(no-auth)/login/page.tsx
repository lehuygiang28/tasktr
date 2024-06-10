'use client';

import { useLogin } from '@refinedev/core';
import { Layout, Space, Form, Input, Typography, Divider } from 'antd';
import { MailOutlined, GithubOutlined, GoogleOutlined } from '@ant-design/icons';
import type { LoginActionPayload } from '~/providers/auth-provider/types';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginPwdless } from '~/validators';
import LoadingBtn from '~/components/button/loading-btn';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '~/app/loading';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;
const SEEM_SAFE_HASH_LENGTH = 30;

export default function Login() {
    const router = useRouter();
    const params = useSearchParams();
    const { mutate: login } = useLogin();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginPwdless>({
        resolver: classValidatorResolver(LoginPwdless),
        defaultValues: { email: '' },
    });

    const onSubmit: SubmitHandler<LoginPwdless> = (values) => {
        const data: LoginActionPayload = {
            type: 'request-login',
            email: values.email,
            returnUrl: window?.location?.href,
        };
        return login(data);
    };

    useEffect(() => {
        const hash = params.get('hash');
        if (hash && hash.length > SEEM_SAFE_HASH_LENGTH) {
            login({ type: 'login', hash });
        } else if (hash) {
            const cloneParams = new URLSearchParams(params);
            cloneParams.delete('hash');
            return router.replace(`/login?${cloneParams.toString()}`);
        }
    }, [params, login, router]);

    if (params.get('hash')) {
        return <Loading />;
    }

    return (
        <Layout
            style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <div>
                <Space direction="vertical" align="center">
                    <Title level={3} style={{ marginBottom: '4px' }}>
                        Sign in to your account
                    </Title>
                    <Text>Sign in to your Tasktr</Text>

                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <Controller<LoginPwdless>
                            name={'email'}
                            control={control}
                            render={({ field }) => (
                                <Form.Item<LoginPwdless>
                                    name={'email'}
                                    validateStatus={errors?.email ? 'error' : 'validating'}
                                    help={<>{errors?.email?.message}</>}
                                    rules={[{ required: true }]}
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
                {/* <Divider plain>or continue with</Divider>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Space direction="horizontal" align="center">
                        <LoadingBtn
                            type="primary"
                            style={{ width: '100px', marginBottom: '32px' }}
                            size="middle"
                            isValid={isValid}
                        >
                            <GoogleOutlined /> Google
                        </LoadingBtn>
                        <LoadingBtn
                            type="primary"
                            style={{ width: '100px', marginBottom: '32px' }}
                            size="middle"
                            isValid={isValid}
                        >
                            <GithubOutlined /> Github
                        </LoadingBtn>
                    </Space>
                </div> */}
            </div>

            <Text>
                Don&apos;t have an account yet? <Link href="/register">Sign up </Link>
            </Text>
        </Layout>
    );
}
