'use client';

import { Layout } from 'antd';
import Register from '~/components/pages/register';

export default function RegisterPage() {
    return (
        <Layout
            style={{
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Register />
        </Layout>
    );
}
