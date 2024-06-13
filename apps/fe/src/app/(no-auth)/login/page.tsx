'use client';

import { Layout } from 'antd';
import Login from '~/components/pages/login';

export default function LoginPage() {
    return (
        <Layout
            style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Login />
        </Layout>
    );
}
