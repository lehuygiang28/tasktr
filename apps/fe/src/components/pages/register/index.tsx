'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { Space, Form, Input, Typography, Button, Divider } from 'antd';
import { ArrowLeftOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRegister } from '@refinedev/core';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import Loading from '~/app/loading';
import LoadingBtn from '~/components/button/loading-btn';
import { RegisterValidator } from '~/validators';
import { RegisterActionPayload } from '~/providers/auth-provider/types/register.type';

const { Title, Text } = Typography;
const MAYBE_SAFE_TOKEN_LENGTH = 30;

export type RegisterProps = {
    onBack?: () => void;
};

export default function Register({ onBack }: RegisterProps) {
    const router = useRouter();
    const params = useSearchParams();
    const { mutate: register } = useRegister();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<RegisterValidator>({
        resolver: classValidatorResolver(RegisterValidator),
        defaultValues: { email: '', fullName: undefined },
    });

    const onSubmit: SubmitHandler<RegisterValidator> = (values) => {
        const data: RegisterActionPayload = {
            type: 'request-register',
            email: values.email,
            fullName: values?.fullName,
            returnUrl: window?.location?.href,
        };
        return register(data);
    };

    useEffect(() => {
        const hash = params.get('hash');
        if (hash && hash.length > MAYBE_SAFE_TOKEN_LENGTH) {
            const data: RegisterActionPayload = {
                type: 'register',
                hash: hash,
                to: '/login',
            };
            register(data);
        } else if (hash) {
            const cloneParams = new URLSearchParams(params);
            cloneParams.delete('hash');
            return router.replace(`/register?${cloneParams.toString()}`);
        }
    }, [params, register, router]);

    if (params.get('hash')) {
        return <Loading />;
    }

    return (
        <>
            <div>
                <Space align="start">
                    <Link href={'/'} style={{ all: 'unset' }} onClick={onBack}>
                        <Button type="text">
                            <ArrowLeftOutlined />
                        </Button>
                    </Link>
                </Space>
                <Space direction="vertical" align="center" size="small" style={{ width: '100%' }}>
                    <Title level={3} style={{ marginBottom: '4px' }}>
                        Create an account
                    </Title>
                    <Text>Enter your email to sign up for Tasktr</Text>

                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <Controller<RegisterValidator>
                            name={'email'}
                            control={control}
                            render={({ field }) => (
                                <Form.Item<RegisterValidator>
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
                        <Controller<RegisterValidator>
                            name={'fullName'}
                            control={control}
                            render={({ field }) => (
                                <Form.Item<RegisterValidator>
                                    name={'fullName'}
                                    validateStatus={errors?.fullName ? 'error' : 'validating'}
                                    help={<>{errors?.fullName?.message}</>}
                                    rules={[{ required: false }]}
                                >
                                    <Input
                                        {...field}
                                        prefix={<UserAddOutlined className="site-form-item-icon" />}
                                        placeholder="Your Name"
                                    />
                                </Form.Item>
                            )}
                        />

                        <LoadingBtn
                            content="Register"
                            type="primary"
                            style={{ width: '240px' }}
                            size="middle"
                            htmlType="submit"
                            isValid={isValid}
                        />
                    </form>

                    <Text>
                        If you already have an account, go <Link href="/login/">login</Link>
                    </Text>
                    <Divider plain></Divider>
                    <Text type="secondary">
                        By continue to register you agree to our{' '}
                        <Link href="/privacy">Privacy Policy</Link>
                    </Text>
                </Space>
            </div>
        </>
    );
}
