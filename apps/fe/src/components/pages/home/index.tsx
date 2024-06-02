'use client';

import { Layout } from 'antd';
import HomePageHeader from './header';
import HomePageContent from './content';
import HomePageFooter from './footer';

export default function HomePage() {
    return (
        <Layout style={{ overflowX: 'hidden' }}>
            <HomePageHeader />
            <HomePageContent />
            <HomePageFooter />
        </Layout>
    );
}
