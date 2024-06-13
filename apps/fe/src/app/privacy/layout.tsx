'use client';

import { PropsWithChildren } from 'react';
import { Layout } from 'antd';

export default function PrivacyLayout({ children }: PropsWithChildren) {
    return <Layout>{children}</Layout>;
}
